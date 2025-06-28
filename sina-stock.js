module.exports = function(RED) {
    "use strict";
    var http = require('http');
    var iconv = require('iconv-lite');

    function SinaStockNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.stockCodes = config.stockCodes || "";
        this.outputLanguage = config.outputLanguage || "en";

        // 格式化股票数据为更友好的JSON格式
        function formatStockData(stockInfoArray, codeArray) {
            var result = [];
            
            // 输出原始数据，用于调试
            node.log("原始数据数组长度: " + stockInfoArray.length);
            if (stockInfoArray.length > 0) {
                node.log("第一条原始数据: " + stockInfoArray[0]);
            }
            
            // 根据语言选择键名
            const keyNames = node.outputLanguage === "zh" ? {
                code: "股票代码",
                name: "股票名称",
                open: "开盘价",
                previousClose: "昨收价",
                price: "当前价格",
                high: "最高价",
                low: "最低价",
                bid: "竞买价",
                ask: "竞卖价",
                volume: "成交量",
                amount: "成交额",
                bidVolume1: "买一量",
                bidPrice1: "买一价",
                bidVolume2: "买二量",
                bidPrice2: "买二价",
                bidVolume3: "买三量",
                bidPrice3: "买三价",
                bidVolume4: "买四量",
                bidPrice4: "买四价",
                bidVolume5: "买五量",
                bidPrice5: "买五价",
                askVolume1: "卖一量",
                askPrice1: "卖一价",
                askVolume2: "卖二量",
                askPrice2: "卖二价",
                askVolume3: "卖三量",
                askPrice3: "卖三价",
                askVolume4: "卖四量",
                askPrice4: "卖四价",
                askVolume5: "卖五量",
                askPrice5: "卖五价",
                date: "日期",
                time: "时间"
            } : {
                code: "code",
                name: "name",
                open: "open",
                previousClose: "previousClose",
                price: "price",
                high: "high",
                low: "low",
                bid: "bid",
                ask: "ask",
                volume: "volume",
                amount: "amount",
                bidVolume1: "bidVolume1",
                bidPrice1: "bidPrice1",
                bidVolume2: "bidVolume2",
                bidPrice2: "bidPrice2",
                bidVolume3: "bidVolume3",
                bidPrice3: "bidPrice3",
                bidVolume4: "bidVolume4",
                bidPrice4: "bidPrice4",
                bidVolume5: "bidVolume5",
                bidPrice5: "bidPrice5",
                askVolume1: "askVolume1",
                askPrice1: "askPrice1",
                askVolume2: "askVolume2",
                askPrice2: "askPrice2",
                askVolume3: "askVolume3",
                askPrice3: "askPrice3",
                askVolume4: "askVolume4",
                askPrice4: "askPrice4",
                askVolume5: "askVolume5",
                askPrice5: "askPrice5",
                date: "date",
                time: "time"
            };
            
            for (var i = 0; i < stockInfoArray.length; i++) {
                var stockNode = stockInfoArray[i].split(',');
                if (stockNode.length < 32) {
                    node.log("警告: 股票数据格式不完整: " + stockInfoArray[i]);
                    continue;
                }
                
                var stockData = {};
                
                // 使用传入的股票代码作为code值
                stockData[keyNames.code] = codeArray[i];
                stockData[keyNames.name] = stockNode[0];
                stockData[keyNames.open] = parseFloat(stockNode[1]);
                stockData[keyNames.previousClose] = parseFloat(stockNode[2]);
                stockData[keyNames.price] = parseFloat(stockNode[3]);
                stockData[keyNames.high] = parseFloat(stockNode[4]);
                stockData[keyNames.low] = parseFloat(stockNode[5]);
                stockData[keyNames.bid] = parseFloat(stockNode[6]);
                stockData[keyNames.ask] = parseFloat(stockNode[7]);
                stockData[keyNames.volume] = parseInt(stockNode[8]);
                stockData[keyNames.amount] = parseFloat(stockNode[9]);
                stockData[keyNames.bidVolume1] = parseInt(stockNode[10]);
                stockData[keyNames.bidPrice1] = parseFloat(stockNode[11]);
                stockData[keyNames.bidVolume2] = parseInt(stockNode[12]);
                stockData[keyNames.bidPrice2] = parseFloat(stockNode[13]);
                stockData[keyNames.bidVolume3] = parseInt(stockNode[14]);
                stockData[keyNames.bidPrice3] = parseFloat(stockNode[15]);
                stockData[keyNames.bidVolume4] = parseInt(stockNode[16]);
                stockData[keyNames.bidPrice4] = parseFloat(stockNode[17]);
                stockData[keyNames.bidVolume5] = parseInt(stockNode[18]);
                stockData[keyNames.bidPrice5] = parseFloat(stockNode[19]);
                stockData[keyNames.askVolume1] = parseInt(stockNode[20]);
                stockData[keyNames.askPrice1] = parseFloat(stockNode[21]);
                stockData[keyNames.askVolume2] = parseInt(stockNode[22]);
                stockData[keyNames.askPrice2] = parseFloat(stockNode[23]);
                stockData[keyNames.askVolume3] = parseInt(stockNode[24]);
                stockData[keyNames.askPrice3] = parseFloat(stockNode[25]);
                stockData[keyNames.askVolume4] = parseInt(stockNode[26]);
                stockData[keyNames.askPrice4] = parseFloat(stockNode[27]);
                stockData[keyNames.askVolume5] = parseInt(stockNode[28]);
                stockData[keyNames.askPrice5] = parseFloat(stockNode[29]);
                stockData[keyNames.date] = stockNode[30];
                stockData[keyNames.time] = stockNode[31];
                
                result.push(stockData);
            }
            
            return result;
        }

        // 直接调用新浪API获取数据
        function directApiCall(codes) {
            return new Promise((resolve, reject) => {
                // 构建API URL
                var list = codes.split(',');
                var url = 'http://hq.sinajs.cn/list=' + codes;
                
                node.log("API URL: " + url);
                
                var options = {
                    headers: {
                        'referer': 'https://finance.sina.com.cn/'
                    }
                };
                http.get(url, options, function(res) {
                    var chunks = [];
                    res.on('data', function(chunk) {
                        chunks.push(chunk);
                    });
                    
                    res.on('end', function() {
                        var buffer = Buffer.concat(chunks);
                        var str = iconv.decode(buffer, 'GBK'); // 新浪API返回的是GBK编码
                        
                        node.log("API返回数据长度: " + str.length);
                        if (str.length < 20) {
                            node.log("API返回数据内容: " + str); // 如果数据很少，直接显示
                        } else {
                            node.log("API返回数据摘要: " + str.substring(0, 100) + "...");
                        }
                        
                        var stockInfoArray = [];
                        var foundCodeArray = [];
                        
                        // 解析返回的数据
                        list.forEach(function(code) {
                            var pattern = new RegExp('var hq_str_' + code + '="(.+?)";');
                            var match = str.match(pattern);
                            
                            if (match && match[1]) {
                                var stockInfo = match[1];
                                node.log("找到股票 " + code + " 数据: " + stockInfo.substring(0, 20) + "...");
                                stockInfoArray.push(stockInfo);
                                foundCodeArray.push(code);
                            } else {
                                node.warn("未找到股票 " + code + " 的数据");
                            }
                        });
                        
                        resolve({data: stockInfoArray, codes: foundCodeArray});
                    });
                    
                    res.on('error', function(err) {
                        node.error("API请求错误: " + err.message);
                        reject(err);
                    });
                }).on('error', function(err) {
                    node.error("HTTP请求错误: " + err.message);
                    reject(err);
                });
            });
        }

        // 获取股票数据
        function getStockData() {
            if (node.stockCodes) {
                node.log("正在获取股票数据，股票代码: " + node.stockCodes);
                // 确保股票代码前缀正确
                let codes = node.stockCodes.split(',').map(code => {
                    code = code.trim();
                    // 如果代码不包含前缀，添加默认前缀
                    if (!code.startsWith('sh') && !code.startsWith('sz') && !code.startsWith('bj')) {
                        // 根据代码规则添加前缀
                        if (code.startsWith('6')) {
                            return 'sh' + code;
                        } else if (code.startsWith('0') || code.startsWith('3')) {
                            return 'sz' + code;
                        } else if (code.startsWith('4') || code.startsWith('8')) {
                            return 'bj' + code;
                        }
                    }
                    return code;
                }).join(',');
                
                node.log("格式化后的股票代码: " + codes);
                
                // 直接调用API获取数据
                directApiCall(codes).then(function(result) {
                    var stockInfoArray = result.data;
                    var foundCodeArray = result.codes;
                    
                    if (!stockInfoArray || stockInfoArray.length === 0) {
                        node.warn("API调用未返回股票数据");
                        node.status({fill:"red", shape:"dot", text:"获取数据失败"});
                        return;
                    }
                    
                    var formattedData = formatStockData(stockInfoArray, foundCodeArray);
                    node.log("API调用：格式化后的数据条数: " + formattedData.length);
                    var msg = { payload: formattedData };
                    node.status({fill:"green", shape:"dot", text:"获得 " + formattedData.length + "条数据"});
                    node.send(msg);
                }).catch(function(err) {
                    node.error("API调用出错: " + err);
                    node.status({fill:"red", shape:"dot", text:"API错误"});
                });
            } else {
                node.status({fill:"yellow", shape:"ring", text:"未配置股票代码"});
            }
        }
        
        // 节点输入触发更新
        node.on('input', function(msg) {
            // 如果消息中有股票代码，则使用消息中的代码
            if (msg.stockCodes) {
                node.stockCodes = msg.stockCodes;
                node.log("从输入消息stockCodes属性获取股票代码: " + node.stockCodes);
            } else if (msg.payload && typeof msg.payload === 'string' && msg.payload.trim() !== '') {
                node.stockCodes = msg.payload;
                node.log("从输入消息获取股票代码: " + node.stockCodes);
            }
            // 如果消息中有输出语言设置，则使用消息中的设置
            if (msg.outputLanguage) {
                node.outputLanguage = msg.outputLanguage === "zh" ? "zh" : "en";
                node.log("从输入消息获取输出语言设置: " + node.outputLanguage);
            }
            
            getStockData();
        });

        // 节点关闭时清理
        this.on('close', function() {
            node.status({});
        });

        // 初始状态
        node.status({fill:"blue", shape:"ring", text:"准备就绪"});
    }
    
    RED.nodes.registerType("sina-stock", SinaStockNode);
} 