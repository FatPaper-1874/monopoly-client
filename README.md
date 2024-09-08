# monopoly-client

FatPaper 大富翁的 web 客户端

#### 运行

`yarn dev`

#### 打包

`yarn build`

#### 目录结构

```
├─📁 public------------------------ # 资源
│ ├─📁 draco----------------------- # 模型解密工具
│ └─📄 logo.ico-------------------- # logo
├─📁 src
│ ├─📁 assets
│ │ ├─📁 font---------------------- # 字体
│ │ ├─📄 style.scss---------------- # 全局样式
│ │ └─📄 ui.scss------------------- # 全局UI样式
│ ├─📁 axios----------------------- # axios
│ ├─📁 classes--------------------- # 重要类
│ │ ├─📁 game
│ │ │ ├─📄 Animated2DBase.ts
│ │ │ ├─📄 GameEntity.ts
│ │ │ ├─📄 GameRenderer.ts--------- # 游戏渲染工具
│ │ │ └─📄 PlayerEntity.ts--------- # 玩家实体
│ │ ├─📁 three--------------------- # three.js相关
│ │ │ ├─📄 DiceRenderer.ts--------- # 骰子类
│ │ │ ├─📄 LoginDiceRenderer.ts---- # 登陆页面骰子
│ │ │ └─📄 ThreeSceneBase.ts------- # three.js场景基类
│ │ └─📁 websocket
│ │   └─📄 GameSocketClient.ts----- # websocket客户端
│ ├─📁 components------------------ # 组件
│ │ ├─📁 common
│ │ └─📁 utils
│ │   ├─📁 fp-dialog--------------- # dialog组件
│ │   ├─📁 fp-loading-------------- # loading组件
│ │   ├─📁 fp-message-------------- # message组件
│ │   ├─📁 fp-message-box---------- # message-box组件
│ │   ├─📁 fp-popover-------------- # popover组件
│ │   └─📁 item-selector----------- # 选择器组件
│ ├─📁 directives------------------ # 自定义指令
│ │ └─📄 chanceCardDrag.ts--------- # 机会卡拖拽指令
│ ├─📁 enums----------------------- # 枚举
│ ├─📁 interfaces------------------ # 接口
│ ├─📁 router---------------------- # 路由
│ ├─📁 store----------------------- # 数据仓库
│ ├─📁 utils
│ │ ├─📁 api----------------------- # api
│ │ ├─📁 event-bus----------------- # 事件发布订阅
│ │ ├─📁 spine-threejs------------- # spine在three.js中运行的工具
│ │ ├─📁 three--------------------- # three.js相关工具
│ │ ├─📄 index.ts------------------ # 工具函数集
│ │ └─📄 var.ts-------------------- # 静态数据
│ ├─📁 views
│ │ ├─📁 background---------------- # 背景组件
│ │ ├─📁 chat---------------------- # 聊天组件
│ │ ├─📁 danmaku------------------- # 弹幕组件
│ │ ├─📁 game---------------------- # 游戏页面
│ │ ├─📁 hall---------------------- # 大厅页面
│ │ ├─📁 login--------------------- # 登陆页面
│ │ ├─📁 music_player-------------- # 音乐播放器组件
│ │ ├─📁 room---------------------- # 房间页面
│ │ └─📁 screen_mask--------------- # 遮罩层组件
│ ├─📄 App.vue
│ └─📄 main.ts
└─📄 global.config.ts-------------- # 配置数据桥梁
```
