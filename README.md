# node-red-contrib-sina-finance

Node-RED节点用于获取新浪财经股票行情数据。

## 安装

在您的Node-RED用户目录中运行以下命令:

```bash
npm install node-red-contrib-sina-finance
```

或者通过Node-RED管理面板安装该节点。

## 功能

此节点使用新浪财经API获取实时股票行情数据。主要功能有:

- 获取股票实时价格、交易量等基本行情数据
- 获取买卖盘5档报价和数量
- 支持多个股票代码批量查询
- 支持手动触发更新
- 支持中英文输出格式切换
- 完整的JSON格式输出

## 使用方法

### 基本配置

1. 从节点面板中拖拽"新浪股票"节点到工作流中
2. 双击节点进行配置:
   - **名称**: 节点显示名称(可选)
   - **股票代码**: 需要查询的股票代码，格式为sh或sz开头，多个代码用逗号分隔，如`sh600001,sz000001`
   - **输出语言**: 选择输出数据使用中文键名还是英文键名

### 股票代码格式

- 上海证券交易所: `sh`开头，如`sh600001`，也可以直接使用数字`600001`
- 深圳证券交易所: `sz`开头，如`sz000001`，也可以直接使用数字`000001` 
- 北京证券交易所: `bj`开头，如`bj430047`，也可以直接使用数字`430047`

### 输入

- 节点可接收任何输入消息触发数据获取
- 通过`msg.payload`或者`msg.stockCodes`可动态设置查询的股票代码
- 通过`msg.outputLanguage`可动态设置输出语言（"en"为英文，"zh"为中文）

### 输出

节点输出`msg.payload`包含一个数组，每个元素对应一支股票的数据:

英文输出示例:
```javascript
[
  {
    "code": "sh600001",
    "name": "邯郸钢铁",
    "open": 3.44,
    "previousClose": 3.42,
    "price": 3.49,
    "high": 3.55,
    "low": 3.41,
    // ... 更多数据
    "date": "2023-05-30",
    "time": "15:00:00"
  },
  // ... 更多股票
]
```

中文输出示例:
```javascript
[
  {
    "股票代码": "sh600001",
    "股票名称": "邯郸钢铁",
    "开盘价": 3.44,
    "昨收价": 3.42,
    "当前价格": 3.49,
    "最高价": 3.55,
    "最低价": 3.41,
    // ... 更多数据
    "日期": "2023-05-30",
    "时间": "15:00:00"
  },
  // ... 更多股票
]
```

## 示例流

以下示例展示如何使用此节点获取股票数据并在调试面板中显示:

```json
[
  {
    "id": "f6f2187d.f17ca8",
    "type": "sina-stock",
    "z": "2b9467.8f7c0cc8",
    "name": "平安银行数据",
    "stockCodes": "sz000001",
    "outputLanguage": "zh",
    "x": 290,
    "y": 220,
    "wires": [
      [
        "c6ea57bc.2498c8"
      ]
    ]
  },
  {
    "id": "c6ea57bc.2498c8",
    "type": "debug",
    "z": "2b9467.8f7c0cc8",
    "name": "股票数据",
    "active": true,
    "tosidebar": true,
    "console": false,
    "tostatus": false,
    "complete": "payload",
    "targetType": "msg",
    "statusVal": "",
    "statusType": "auto",
    "x": 500,
    "y": 220,
    "wires": []
  },
  {
    "id": "eacf6d7.88b787",
    "type": "inject",
    "z": "2b9467.8f7c0cc8",
    "name": "手动触发",
    "props": [
      {
        "p": "payload"
      }
    ],
    "repeat": "",
    "crontab": "",
    "once": false,
    "onceDelay": 0.1,
    "topic": "",
    "payload": "",
    "payloadType": "date",
    "x": 120,
    "y": 220,
    "wires": [
      [
        "f6f2187d.f17ca8"
      ]
    ]
  }
]
```

## 许可证
注意,本节点为测试用途,请于24小时内删除,所使用的api为网络公开搜集的新浪财经API,请遵守其使用规定.
该项目基于MIT许可证发布。 