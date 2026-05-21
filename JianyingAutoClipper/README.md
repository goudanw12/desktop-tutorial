
# 剪映自动剪辑软件

跨平台桌面应用程序，用于自动化剪映视频剪辑工作流程。

## 功能特性

- **任务管理**：创建、管理和执行剪辑任务
- **模板系统**：创建和重用剪辑模板
- **批量处理**：支持批量导入和处理多个视频
- **跨平台**：支持 Windows 和 macOS
- **自动化控制**：自动启动和控制剪映应用

## 技术栈

- **UI 框架**：Avalonia UI 11
- **开发语言**：C# 12
- **运行时**：.NET 8
- **架构模式**：MVVM

## 项目结构

```
JianyingAutoClipper/
├── src/
│   ├── JianyingAutoClipper.App/          # 主应用程序 (UI)
│   ├── JianyingAutoClipper.Core/         # 核心业务逻辑
│   └── JianyingAutoClipper.Infrastructure/ # 基础设施层
└── templates/                            # 模板文件
```

## 开发指南

### 前置要求

- .NET 8 SDK
- Visual Studio 2022 / VS Code / Rider

### 构建和运行

```bash
# 恢复依赖
dotnet restore

# 构建项目
dotnet build

# 运行应用程序
dotnet run --project src/JianyingAutoClipper.App
```

## 使用说明

1. 确保已安装剪映专业版
2. 启动应用程序
3. 创建或选择剪辑模板
4. 导入视频文件
5. 配置任务参数
6. 开始自动化剪辑

## 注意事项

- 本软件需要剪映专业版已安装在系统中
- 自动化功能通过 UI 自动化实现，可能因剪映版本更新而需要适配
- 建议先使用少量视频进行测试

