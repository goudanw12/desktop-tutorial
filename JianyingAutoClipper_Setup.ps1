
# 剪映自动剪辑软件 - 项目自动生成脚本
# 使用方法: 在 PowerShell 中运行: .\JianyingAutoClipper_Setup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  剪映自动剪辑软件 - 项目生成器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 设置项目根目录
$projectRoot = Join-Path $PSScriptRoot "JianyingAutoClipper"
Write-Host "项目将创建在: $projectRoot" -ForegroundColor Yellow

# 创建目录结构
Write-Host ""
Write-Host "正在创建目录结构..." -ForegroundColor Green
$dirs = @(
    "$projectRoot\src\JianyingAutoClipper.App\Views",
    "$projectRoot\src\JianyingAutoClipper.App\ViewModels",
    "$projectRoot\src\JianyingAutoClipper.Core\Models",
    "$projectRoot\src\JianyingAutoClipper.Core\Services",
    "$projectRoot\src\JianyingAutoClipper.Core\Interfaces",
    "$projectRoot\src\JianyingAutoClipper.Infrastructure\Automation",
    "$projectRoot\templates"
)
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✓ 创建目录: $dir" -ForegroundColor Gray
    }
}

# 1. 解决方案文件
Write-Host ""
Write-Host "正在创建解决方案文件..." -ForegroundColor Green
$slnContent = @"

Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.0.31903.59
MinimumVisualStudioVersion = 10.0.40219.1
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "JianyingAutoClipper.App", "src\JianyingAutoClipper.App\JianyingAutoClipper.App.csproj", "{8A4B3E8C-1D2F-4A5B-8C9D-3E7F1A2B4C5D}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "JianyingAutoClipper.Core", "src\JianyingAutoClipper.Core\JianyingAutoClipper.Core.csproj", "{1B2C3D4E-5F6A-7B8C-9D0E-1F2A3B4C5D6E}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "JianyingAutoClipper.Infrastructure", "src\JianyingAutoClipper.Infrastructure\JianyingAutoClipper.Infrastructure.csproj", "{9A8B7C6D-5E4F-3A2B-1C0D-9E8F7A6B5C4D}"
EndProject
Global
	GlobalSection(SolutionConfigurationPlatforms) = preSolution
		Debug|Any CPU = Debug|Any CPU
		Release|Any CPU = Release|Any CPU
	EndGlobalSection
	GlobalSection(ProjectConfigurationPlatforms) = postSolution
		{8A4B3E8C-1D2F-4A5B-8C9D-3E7F1A2B4C5D}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{8A4B3E8C-1D2F-4A5B-8C9D-3E7F1A2B4C5D}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{8A4B3E8C-1D2F-4A5B-8C9D-3E7F1A2B4C5D}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{8A4B3E8C-1D2F-4A5B-8C9D-3E7F1A2B4C5D}.Release|Any CPU.Build.0 = Release|Any CPU
		{1B2C3D4E-5F6A-7B8C-9D0E-1F2A3B4C5D6E}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{1B2C3D4E-5F6A-7B8C-9D0E-1F2A3B4C5D6E}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{1B2C3D4E-5F6A-7B8C-9D0E-1F2A3B4C5D6E}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{1B2C3D4E-5F6A-7B8C-9D0E-1F2A3B4C5D6E}.Release|Any CPU.Build.0 = Release|Any CPU
		{9A8B7C6D-5E4F-3A2B-1C0D-9E8F7A6B5C4D}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{9A8B7C6D-5E4F-3A2B-1C0D-9E8F7A6B5C4D}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{9A8B7C6D-5E4F-3A2B-1C0D-9E8F7A6B5C4D}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{9A8B7C6D-5E4F-3A2B-1C0D-9E8F7A6B5C4D}.Release|Any CPU.Build.0 = Release|Any CPU
	EndGlobalSection
EndGlobal

"@
$slnContent | Out-File -FilePath "$projectRoot\JianyingAutoClipper.sln" -Encoding utf8
Write-Host "  ✓ JianyingAutoClipper.sln" -ForegroundColor Gray

# 2. README.md
$readmeContent = @"
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
"@
$readmeContent | Out-File -FilePath "$projectRoot\README.md" -Encoding utf8
Write-Host "  ✓ README.md" -ForegroundColor Gray

# 3. JianyingAutoClipper.Core.csproj
$coreCsproj = @"
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

</Project>
"@
$coreCsproj | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Core\JianyingAutoClipper.Core.csproj" -Encoding utf8
Write-Host "  ✓ JianyingAutoClipper.Core.csproj" -ForegroundColor Gray

# 4. JianyingAutoClipper.Infrastructure.csproj
$infraCsproj = @"
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <ItemGroup>
    <ProjectReference Include="..\JianyingAutoClipper.Core\JianyingAutoClipper.Core.csproj" />
  </ItemGroup>

</Project>
"@
$infraCsproj | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Infrastructure\JianyingAutoClipper.Infrastructure.csproj" -Encoding utf8
Write-Host "  ✓ JianyingAutoClipper.Infrastructure.csproj" -ForegroundColor Gray

# 5. JianyingAutoClipper.App.csproj
$appCsproj = @"
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <BuiltInComInteropSupport Condition="`$([MSBuild]::IsOSPlatform('Windows'))">true</BuiltInComInteropSupport>
    <ApplicationManifest>app.manifest</ApplicationManifest>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Avalonia" Version="11.1.0" />
    <PackageReference Include="Avalonia.Desktop" Version="11.1.0" />
    <PackageReference Include="Avalonia.Themes.Fluent" Version="11.1.0" />
    <PackageReference Include="Avalonia.Fonts.Inter" Version="11.1.0" />
    <PackageReference Include="CommunityToolkit.Mvvm" Version="8.2.2" />
    <PackageReference Include="Microsoft.Extensions.DependencyInjection" Version="8.0.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\JianyingAutoClipper.Core\JianyingAutoClipper.Core.csproj" />
    <ProjectReference Include="..\JianyingAutoClipper.Infrastructure\JianyingAutoClipper.Infrastructure.csproj" />
  </ItemGroup>

</Project>
"@
$appCsproj | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.App\JianyingAutoClipper.App.csproj" -Encoding utf8
Write-Host "  ✓ JianyingAutoClipper.App.csproj" -ForegroundColor Gray

# 6. app.manifest
$manifest = @"
<?xml version="1.0" encoding="utf-8"?>
<assembly manifestVersion="1.0" xmlns="urn:schemas-microsoft-com:asm.v1">
  <assemblyIdentity version="1.0.0.0" name="JianyingAutoClipper.App"/>
</assembly>
"@
$manifest | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.App\app.manifest" -Encoding utf8
Write-Host "  ✓ app.manifest" -ForegroundColor Gray

# 7. Program.cs
$programCs = @"
using Avalonia;
using System;

namespace JianyingAutoClipper.App;

class Program
{
    [STAThread]
    public static void Main(string[] args) => BuildAvaloniaApp()
        .StartWithClassicDesktopLifetime(args);

    public static AppBuilder BuildAvaloniaApp()
        => AppBuilder.Configure<App>()
            .UsePlatformDetect()
            .WithInterFont()
            .LogToTrace();
}
"@
$programCs | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.App\Program.cs" -Encoding utf8
Write-Host "  ✓ Program.cs" -ForegroundColor Gray

# 8. ViewModelBase.cs
$viewModelBase = @"
using CommunityToolkit.Mvvm.ComponentModel;

namespace JianyingAutoClipper.App.ViewModels;

public class ViewModelBase : ObservableObject
{
}
"@
$viewModelBase | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.App\ViewModels\ViewModelBase.cs" -Encoding utf8
Write-Host "  ✓ ViewModelBase.cs" -ForegroundColor Gray

# 9. 数据模型 - ClipActionType.cs
$clipActionType = @"
namespace JianyingAutoClipper.Core.Models;

public enum ClipActionType
{
    Cut,
    Trim,
    AddTransition,
    AddFilter,
    AddText,
    AddMusic,
    AdjustSpeed
}
"@
$clipActionType | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Core\Models\ClipActionType.cs" -Encoding utf8
Write-Host "  ✓ ClipActionType.cs" -ForegroundColor Gray

# 10. ClipAction.cs
$clipAction = @"
namespace JianyingAutoClipper.Core.Models;

public class ClipAction
{
    public ClipActionType Type { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan Duration { get; set; }
    public Dictionary<string, object> Parameters { get; set; } = new();
}
"@
$clipAction | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Core\Models\ClipAction.cs" -Encoding utf8
Write-Host "  ✓ ClipAction.cs" -ForegroundColor Gray

# 11. ClipTaskStatus.cs
$clipTaskStatus = @"
namespace JianyingAutoClipper.Core.Models;

public enum ClipTaskStatus
{
    Pending,
    Running,
    Paused,
    Completed,
    Failed,
    Cancelled
}
"@
$clipTaskStatus | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Core\Models\ClipTaskStatus.cs" -Encoding utf8
Write-Host "  ✓ ClipTaskStatus.cs" -ForegroundColor Gray

# 12. ExportSettings.cs
$exportSettings = @"
namespace JianyingAutoClipper.Core.Models;

public class ExportSettings
{
    public string OutputFormat { get; set; } = "mp4";
    public int ResolutionWidth { get; set; } = 1920;
    public int ResolutionHeight { get; set; } = 1080;
    public int Bitrate { get; set; } = 8000;
    public int FrameRate { get; set; } = 30;
}
"@
$exportSettings | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Core\Models\ExportSettings.cs" -Encoding utf8
Write-Host "  ✓ ExportSettings.cs" -ForegroundColor Gray

# 13. ClipTemplate.cs
$clipTemplate = @"
namespace JianyingAutoClipper.Core.Models;

public class ClipTemplate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<ClipAction> Actions { get; set; } = new();
    public TimeSpan DefaultDuration { get; set; } = TimeSpan.FromSeconds(60);
    public ExportSettings DefaultExportSettings { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }
}
"@
$clipTemplate | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Core\Models\ClipTemplate.cs" -Encoding utf8
Write-Host "  ✓ ClipTemplate.cs" -ForegroundColor Gray

# 14. ClipTask.cs
$clipTask = @"
namespace JianyingAutoClipper.Core.Models;

public class ClipTask
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public ClipTaskStatus Status { get; set; } = ClipTaskStatus.Pending;
    public List<string> VideoFiles { get; set; } = new();
    public ClipTemplate? Template { get; set; }
    public ExportSettings ExportSettings { get; set; } = new();
    public double Progress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public string OutputDirectory { get; set; } = string.Empty;
}
"@
$clipTask | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Core\Models\ClipTask.cs" -Encoding utf8
Write-Host "  ✓ ClipTask.cs" -ForegroundColor Gray

# 15. ClipTaskConfig.cs
$clipTaskConfig = @"
namespace JianyingAutoClipper.Core.Models;

public class ClipTaskConfig
{
    public string Name { get; set; } = string.Empty;
    public List<string> VideoFiles { get; set; } = new();
    public Guid TemplateId { get; set; }
    public ExportSettings? ExportSettings { get; set; }
    public string OutputDirectory { get; set; } = string.Empty;
}
"@
$clipTaskConfig | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Core\Models\ClipTaskConfig.cs" -Encoding utf8
Write-Host "  ✓ ClipTaskConfig.cs" -ForegroundColor Gray

# 16. TaskProgressEventArgs.cs
$taskProgressArgs = @"
namespace JianyingAutoClipper.Core.Models;

public class TaskProgressEventArgs : EventArgs
{
    public Guid TaskId { get; set; }
    public double Progress { get; set; }
    public string Message { get; set; } = string.Empty;
    public ClipTaskStatus? NewStatus { get; set; }
}
"@
$taskProgressArgs | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Core\Models\TaskProgressEventArgs.cs" -Encoding utf8
Write-Host "  ✓ TaskProgressEventArgs.cs" -ForegroundColor Gray

# 17. 接口 - ITemplateService.cs
$iTemplateService = @"
using JianyingAutoClipper.Core.Models;

namespace JianyingAutoClipper.Core.Interfaces;

public interface ITemplateService
{
    Task<ClipTemplate> CreateTemplateAsync(string name);
    Task<ClipTemplate?> LoadTemplateAsync(string filePath);
    Task SaveTemplateAsync(ClipTemplate template, string filePath);
    Task<IEnumerable<ClipTemplate>> GetTemplatesAsync();
    Task DeleteTemplateAsync(Guid templateId);
}
"@
$iTemplateService | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Core\Interfaces\ITemplateService.cs" -Encoding utf8
Write-Host "  ✓ ITemplateService.cs" -ForegroundColor Gray

# 18. ITaskService.cs
$iTaskService = @"
using JianyingAutoClipper.Core.Models;

namespace JianyingAutoClipper.Core.Interfaces;

public interface ITaskService
{
    Task<ClipTask> CreateTaskAsync(ClipTaskConfig config);
    Task StartTaskAsync(Guid taskId);
    Task PauseTaskAsync(Guid taskId);
    Task StopTaskAsync(Guid taskId);
    Task<IEnumerable<ClipTask>> GetTasksAsync();
    Task<ClipTask?> GetTaskAsync(Guid taskId);
    Task DeleteTaskAsync(Guid taskId);
    event EventHandler<TaskProgressEventArgs> TaskProgress;
}
"@
$iTaskService | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Core\Interfaces\ITaskService.cs" -Encoding utf8
Write-Host "  ✓ ITaskService.cs" -ForegroundColor Gray

# 19. IAutomationService.cs
$iAutomationService = @"
using JianyingAutoClipper.Core.Models;

namespace JianyingAutoClipper.Core.Interfaces;

public interface IAutomationService
{
    Task<bool> IsJianyingRunningAsync();
    Task LaunchJianyingAsync();
    Task CloseJianyingAsync();
    Task ImportVideoAsync(string videoPath);
    Task ApplyTemplateAsync(ClipTemplate template);
    Task ExportVideoAsync(string outputPath, ExportSettings settings);
    Task<bool> VerifyJianyingInstallationAsync();
}
"@
$iAutomationService | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Core\Interfaces\IAutomationService.cs" -Encoding utf8
Write-Host "  ✓ IAutomationService.cs" -ForegroundColor Gray

# 20. 服务 - TemplateService.cs
$templateService = @"
using System.Text.Json;
using JianyingAutoClipper.Core.Interfaces;
using JianyingAutoClipper.Core.Models;

namespace JianyingAutoClipper.Core.Services;

public class TemplateService : ITemplateService
{
    private readonly string _templatesDirectory;
    private readonly List<ClipTemplate> _templates = new();

    public TemplateService()
    {
        _templatesDirectory = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "JianyingAutoClipper",
            "Templates");
        
        if (!Directory.Exists(_templatesDirectory))
        {
            Directory.CreateDirectory(_templatesDirectory);
        }
        
        LoadTemplatesFromDisk();
    }

    public Task<ClipTemplate> CreateTemplateAsync(string name)
    {
        var template = new ClipTemplate
        {
            Name = name,
            CreatedAt = DateTime.Now
        };
        
        _templates.Add(template);
        return Task.FromResult(template);
    }

    public async Task<ClipTemplate?> LoadTemplateAsync(string filePath)
    {
        if (!File.Exists(filePath))
        {
            return null;
        }
        
        var json = await File.ReadAllTextAsync(filePath);
        var template = JsonSerializer.Deserialize<ClipTemplate>(json);
        return template;
    }

    public async Task SaveTemplateAsync(ClipTemplate template, string filePath)
    {
        template.UpdatedAt = DateTime.Now;
        var json = JsonSerializer.Serialize(template, new JsonSerializerOptions
        {
            WriteIndented = true
        });
        await File.WriteAllTextAsync(filePath, json);
    }

    public Task<IEnumerable<ClipTemplate>> GetTemplatesAsync()
    {
        return Task.FromResult(_templates.AsEnumerable());
    }

    public async Task DeleteTemplateAsync(Guid templateId)
    {
        var template = _templates.FirstOrDefault(t => t.Id == templateId);
        if (template != null)
        {
            _templates.Remove(template);
            var filePath = Path.Combine(_templatesDirectory, `$"{templateId}.json");
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
        await Task.CompletedTask;
    }

    private void LoadTemplatesFromDisk()
    {
        var files = Directory.GetFiles(_templatesDirectory, "*.json");
        foreach (var file in files)
        {
            try
            {
                var json = File.ReadAllText(file);
                var template = JsonSerializer.Deserialize<ClipTemplate>(json);
                if (template != null)
                {
                    _templates.Add(template);
                }
            }
            catch
            {
            }
        }
    }
}
"@
$templateService | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Core\Services\TemplateService.cs" -Encoding utf8
Write-Host "  ✓ TemplateService.cs" -ForegroundColor Gray

# 21. TaskService.cs
$taskService = @"
using JianyingAutoClipper.Core.Interfaces;
using JianyingAutoClipper.Core.Models;

namespace JianyingAutoClipper.Core.Services;

public class TaskService : ITaskService
{
    private readonly List<ClipTask> _tasks = new();
    private readonly ITemplateService _templateService;
    private readonly IAutomationService _automationService;
    private readonly Dictionary<Guid, CancellationTokenSource> _cancellationTokens = new();

    public event EventHandler<TaskProgressEventArgs>? TaskProgress;

    public TaskService(ITemplateService templateService, IAutomationService automationService)
    {
        _templateService = templateService;
        _automationService = automationService;
    }

    public async Task<ClipTask> CreateTaskAsync(ClipTaskConfig config)
    {
        var templates = await _templateService.GetTemplatesAsync();
        var template = templates.FirstOrDefault(t => t.Id == config.TemplateId);
        
        var task = new ClipTask
        {
            Name = config.Name,
            VideoFiles = new List<string>(config.VideoFiles),
            Template = template,
            ExportSettings = config.ExportSettings ?? template?.DefaultExportSettings ?? new ExportSettings(),
            OutputDirectory = config.OutputDirectory,
            Status = ClipTaskStatus.Pending,
            Progress = 0
        };
        
        _tasks.Add(task);
        return task;
    }

    public async Task StartTaskAsync(Guid taskId)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == taskId);
        if (task == null || task.Status == ClipTaskStatus.Running)
        {
            return;
        }

        var cts = new CancellationTokenSource();
        _cancellationTokens[taskId] = cts;

        task.Status = ClipTaskStatus.Running;
        task.StartedAt = DateTime.Now;
        OnTaskProgress(task, 0, "任务开始执行");

        try
        {
            await ExecuteTaskAsync(task, cts.Token);
            task.Status = ClipTaskStatus.Completed;
            task.CompletedAt = DateTime.Now;
            task.Progress = 100;
            OnTaskProgress(task, 100, "任务完成");
        }
        catch (OperationCanceledException)
        {
            task.Status = ClipTaskStatus.Cancelled;
            OnTaskProgress(task, task.Progress, "任务已取消");
        }
        catch (Exception ex)
        {
            task.Status = ClipTaskStatus.Failed;
            task.ErrorMessage = ex.Message;
            OnTaskProgress(task, task.Progress, `$"任务失败: {ex.Message}");
        }
        finally
        {
            _cancellationTokens.Remove(taskId);
        }
    }

    public Task PauseTaskAsync(Guid taskId)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == taskId);
        if (task != null && task.Status == ClipTaskStatus.Running)
        {
            task.Status = ClipTaskStatus.Paused;
            OnTaskProgress(task, task.Progress, "任务已暂停");
        }
        return Task.CompletedTask;
    }

    public Task StopTaskAsync(Guid taskId)
    {
        if (_cancellationTokens.TryGetValue(taskId, out var cts))
        {
            cts.Cancel();
        }
        return Task.CompletedTask;
    }

    public Task<IEnumerable<ClipTask>> GetTasksAsync()
    {
        return Task.FromResult(_tasks.AsEnumerable());
    }

    public Task<ClipTask?> GetTaskAsync(Guid taskId)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == taskId);
        return Task.FromResult(task);
    }

    public Task DeleteTaskAsync(Guid taskId)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == taskId);
        if (task != null)
        {
            _tasks.Remove(task);
        }
        return Task.CompletedTask;
    }

    private async Task ExecuteTaskAsync(ClipTask task, CancellationToken cancellationToken)
    {
        await _automationService.LaunchJianyingAsync();

        var totalVideos = task.VideoFiles.Count;
        for (int i = 0; i < totalVideos; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var videoFile = task.VideoFiles[i];
            var progress = (double)(i * 100) / totalVideos;
            
            OnTaskProgress(task, progress, `$"正在处理视频 {i + 1}/{totalVideos}: {Path.GetFileName(videoFile)}");

            await _automationService.ImportVideoAsync(videoFile);
            
            if (task.Template != null)
            {
                await _automationService.ApplyTemplateAsync(task.Template);
            }

            var outputFileName = `$"edited_{Path.GetFileNameWithoutExtension(videoFile)}.{task.ExportSettings.OutputFormat}";
            var outputPath = Path.Combine(task.OutputDirectory, outputFileName);
            
            await _automationService.ExportVideoAsync(outputPath, task.ExportSettings);

            await Task.Delay(500, cancellationToken);
        }
    }

    private void OnTaskProgress(ClipTask task, double progress, string message)
    {
        task.Progress = progress;
        TaskProgress?.Invoke(this, new TaskProgressEventArgs
        {
            TaskId = task.Id,
            Progress = progress,
            Message = message,
            NewStatus = task.Status
        });
    }
}
"@
$taskService | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Core\Services\TaskService.cs" -Encoding utf8
Write-Host "  ✓ TaskService.cs" -ForegroundColor Gray

# 22. AutomationService.cs
$automationService = @"
using JianyingAutoClipper.Core.Interfaces;
using JianyingAutoClipper.Core.Models;
using JianyingAutoClipper.Infrastructure.Automation;

namespace JianyingAutoClipper.Core.Services;

public class AutomationService : IAutomationService
{
    private readonly IPlatformAutomationAdapter _adapter;

    public AutomationService()
    {
        _adapter = AutomationAdapterFactory.CreateAdapter();
    }

    public Task<bool> IsJianyingRunningAsync()
    {
        return _adapter.IsJianyingRunningAsync();
    }

    public Task LaunchJianyingAsync()
    {
        return _adapter.LaunchJianyingAsync();
    }

    public Task CloseJianyingAsync()
    {
        return _adapter.CloseJianyingAsync();
    }

    public Task ImportVideoAsync(string videoPath)
    {
        return _adapter.ImportVideoAsync(videoPath);
    }

    public Task ApplyTemplateAsync(ClipTemplate template)
    {
        return _adapter.ApplyTemplateAsync(template);
    }

    public Task ExportVideoAsync(string outputPath, ExportSettings settings)
    {
        return _adapter.ExportVideoAsync(outputPath, settings);
    }

    public Task<bool> VerifyJianyingInstallationAsync()
    {
        return _adapter.VerifyJianyingInstallationAsync();
    }
}
"@
$automationService | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Core\Services\AutomationService.cs" -Encoding utf8
Write-Host "  ✓ AutomationService.cs" -ForegroundColor Gray

# 23. 基础设施 - IPlatformAutomationAdapter.cs
$platformAdapter = @"
using JianyingAutoClipper.Core.Models;

namespace JianyingAutoClipper.Infrastructure.Automation;

public interface IPlatformAutomationAdapter
{
    Task<bool> IsJianyingRunningAsync();
    Task LaunchJianyingAsync();
    Task CloseJianyingAsync();
    Task ImportVideoAsync(string videoPath);
    Task ApplyTemplateAsync(ClipTemplate template);
    Task ExportVideoAsync(string outputPath, ExportSettings settings);
    Task<bool> VerifyJianyingInstallationAsync();
}
"@
$platformAdapter | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Infrastructure\Automation\IPlatformAutomationAdapter.cs" -Encoding utf8
Write-Host "  ✓ IPlatformAutomationAdapter.cs" -ForegroundColor Gray

# 24. AutomationAdapterFactory.cs
$adapterFactory = @"
using System.Runtime.InteropServices;

namespace JianyingAutoClipper.Infrastructure.Automation;

public static class AutomationAdapterFactory
{
    public static IPlatformAutomationAdapter CreateAdapter()
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            return new WindowsAutomationAdapter();
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
        {
            return new MacOSAutomationAdapter();
        }
        
        throw new PlatformNotSupportedException("当前平台不支持");
    }
}
"@
$adapterFactory | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Infrastructure\Automation\AutomationAdapterFactory.cs" -Encoding utf8
Write-Host "  ✓ AutomationAdapterFactory.cs" -ForegroundColor Gray

# 25. WindowsAutomationAdapter.cs
$windowsAdapter = @"
using System.Diagnostics;
using System.Runtime.InteropServices;
using JianyingAutoClipper.Core.Models;

namespace JianyingAutoClipper.Infrastructure.Automation;

public class WindowsAutomationAdapter : IPlatformAutomationAdapter
{
    private const string JianyingProcessName = "JianyingPro";
    private readonly string _jianyingPath;

    public WindowsAutomationAdapter()
    {
        _jianyingPath = FindJianyingInstallationPath();
    }

    public Task<bool> IsJianyingRunningAsync()
    {
        var processes = Process.GetProcessesByName(JianyingProcessName);
        return Task.FromResult(processes.Length > 0);
    }

    public async Task LaunchJianyingAsync()
    {
        if (string.IsNullOrEmpty(_jianyingPath))
        {
            throw new InvalidOperationException("剪映未安装或未找到安装路径");
        }

        if (!await IsJianyingRunningAsync())
        {
            Process.Start(_jianyingPath);
            await Task.Delay(3000);
        }
    }

    public Task CloseJianyingAsync()
    {
        var processes = Process.GetProcessesByName(JianyingProcessName);
        foreach (var process in processes)
        {
            process.CloseMainWindow();
            process.WaitForExit(5000);
            if (!process.HasExited)
            {
                process.Kill();
            }
        }
        return Task.CompletedTask;
    }

    public Task ImportVideoAsync(string videoPath)
    {
        return Task.CompletedTask;
    }

    public Task ApplyTemplateAsync(ClipTemplate template)
    {
        return Task.CompletedTask;
    }

    public Task ExportVideoAsync(string outputPath, ExportSettings settings)
    {
        return Task.CompletedTask;
    }

    public Task<bool> VerifyJianyingInstallationAsync()
    {
        return Task.FromResult(!string.IsNullOrEmpty(_jianyingPath) && File.Exists(_jianyingPath));
    }

    private string FindJianyingInstallationPath()
    {
        var possiblePaths = new[]
        {
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "JianyingPro", "JianyingPro.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),
                "JianyingPro", "JianyingPro.exe"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),
                "JianyingPro", "JianyingPro.exe")
        };

        foreach (var path in possiblePaths)
        {
            if (File.Exists(path))
            {
                return path;
            }
        }

        return string.Empty;
    }
}
"@
$windowsAdapter | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Infrastructure\Automation\WindowsAutomationAdapter.cs" -Encoding utf8
Write-Host "  ✓ WindowsAutomationAdapter.cs" -ForegroundColor Gray

# 26. MacOSAutomationAdapter.cs
$macAdapter = @"
using System.Diagnostics;
using JianyingAutoClipper.Core.Models;

namespace JianyingAutoClipper.Infrastructure.Automation;

public class MacOSAutomationAdapter : IPlatformAutomationAdapter
{
    private const string JianyingBundleId = "com.bytedance.mac.jianyingpro";
    private const string JianyingAppName = "剪映专业版";

    public Task<bool> IsJianyingRunningAsync()
    {
        var script = @"tell application ""System Events""
            return (name of processes) contains """ + JianyingAppName + @"""
        end tell";
        
        var result = ExecuteAppleScript(script);
        return Task.FromResult(result?.Trim() == "true");
    }

    public async Task LaunchJianyingAsync()
    {
        var script = @"tell application """ + JianyingAppName + @"""
            activate
        end tell";
        
        ExecuteAppleScript(script);
        await Task.Delay(3000);
    }

    public Task CloseJianyingAsync()
    {
        var script = @"tell application """ + JianyingAppName + @"""
            quit
        end tell";
        
        ExecuteAppleScript(script);
        return Task.CompletedTask;
    }

    public Task ImportVideoAsync(string videoPath)
    {
        return Task.CompletedTask;
    }

    public Task ApplyTemplateAsync(ClipTemplate template)
    {
        return Task.CompletedTask;
    }

    public Task ExportVideoAsync(string outputPath, ExportSettings settings)
    {
        return Task.CompletedTask;
    }

    public Task<bool> VerifyJianyingInstallationAsync()
    {
        var script = @"tell application ""Finder""
            return exists application file id """ + JianyingBundleId + @"""
        end tell";
        
        var result = ExecuteAppleScript(script);
        return Task.FromResult(result?.Trim() == "true");
    }

    private string? ExecuteAppleScript(string script)
    {
        try
        {
            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "osascript",
                    Arguments = `$"-e ""{script.Replace("""", "\"\"")}""",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                }
            };
            
            process.Start();
            var output = process.StandardOutput.ReadToEnd();
            process.WaitForExit();
            return output;
        }
        catch
        {
            return null;
        }
    }
}
"@
$macAdapter | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.Infrastructure\Automation\MacOSAutomationAdapter.cs" -Encoding utf8
Write-Host "  ✓ MacOSAutomationAdapter.cs" -ForegroundColor Gray

# 27. MainWindowViewModel.cs
$mainWindowVm = @"
using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using JianyingAutoClipper.Core.Interfaces;
using JianyingAutoClipper.Core.Models;

namespace JianyingAutoClipper.App.ViewModels;

public partial class MainWindowViewModel : ViewModelBase
{
    private readonly ITaskService _taskService;
    private readonly ITemplateService _templateService;
    private readonly IAutomationService _automationService;

    [ObservableProperty]
    private ObservableCollection<ClipTask> _tasks = new();

    [ObservableProperty]
    private ObservableCollection<ClipTemplate> _templates = new();

    [ObservableProperty]
    private ClipTask? _selectedTask;

    [ObservableProperty]
    private ClipTemplate? _selectedTemplate;

    [ObservableProperty]
    private string _statusMessage = "就绪";

    [ObservableProperty]
    private bool _isJianyingInstalled;

    [ObservableProperty]
    private bool _isJianyingRunning;

    public MainWindowViewModel(ITaskService taskService, ITemplateService templateService, IAutomationService automationService)
    {
        _taskService = taskService;
        _templateService = templateService;
        _automationService = automationService;
        
        _taskService.TaskProgress += OnTaskProgress;
        
        LoadDataAsync();
        CheckJianyingStatusAsync();
    }

    private async void LoadDataAsync()
    {
        var tasks = await _taskService.GetTasksAsync();
        foreach (var task in tasks)
        {
            Tasks.Add(task);
        }
        
        var templates = await _templateService.GetTemplatesAsync();
        foreach (var template in templates)
        {
            Templates.Add(template);
        }
    }

    private async void CheckJianyingStatusAsync()
    {
        IsJianyingInstalled = await _automationService.VerifyJianyingInstallationAsync();
        IsJianyingRunning = await _automationService.IsJianyingRunningAsync();
    }

    [RelayCommand]
    private async Task StartTaskAsync()
    {
        if (SelectedTask == null) return;
        
        await _taskService.StartTaskAsync(SelectedTask.Id);
        StatusMessage = `$"正在执行任务: {SelectedTask.Name}";
    }

    [RelayCommand]
    private async Task PauseTaskAsync()
    {
        if (SelectedTask == null) return;
        
        await _taskService.PauseTaskAsync(SelectedTask.Id);
        StatusMessage = `$"已暂停任务: {SelectedTask.Name}";
    }

    [RelayCommand]
    private async Task StopTaskAsync()
    {
        if (SelectedTask == null) return;
        
        await _taskService.StopTaskAsync(SelectedTask.Id);
        StatusMessage = `$"已停止任务: {SelectedTask.Name}";
    }

    [RelayCommand]
    private async Task LaunchJianyingAsync()
    {
        try
        {
            await _automationService.LaunchJianyingAsync();
            IsJianyingRunning = true;
            StatusMessage = "剪映已启动";
        }
        catch (Exception ex)
        {
            StatusMessage = `$"启动剪映失败: {ex.Message}";
        }
    }

    [RelayCommand]
    private void CreateNewTask()
    {
        StatusMessage = "创建新任务功能待实现";
    }

    [RelayCommand]
    private void CreateNewTemplate()
    {
        StatusMessage = "创建新模板功能待实现";
    }

    private void OnTaskProgress(object? sender, TaskProgressEventArgs e)
    {
        var task = Tasks.FirstOrDefault(t => t.Id == e.TaskId);
        if (task != null)
        {
            task.Progress = e.Progress;
            if (e.NewStatus.HasValue)
            {
                task.Status = e.NewStatus.Value;
            }
        }
        StatusMessage = e.Message;
    }
}
"@
$mainWindowVm | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.App\ViewModels\MainWindowViewModel.cs" -Encoding utf8
Write-Host "  ✓ MainWindowViewModel.cs" -ForegroundColor Gray

# 28. App.axaml
$appAxaml = @"
<Application xmlns="https://github.com/avaloniaui"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:views="using:JianyingAutoClipper.App.Views"
             x:Class="JianyingAutoClipper.App.App">
    <Application.DataTemplates>
    </Application.DataTemplates>
</Application>
"@
$appAxaml | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.App\App.axaml" -Encoding utf8
Write-Host "  ✓ App.axaml" -ForegroundColor Gray

# 29. App.axaml.cs
$appAxamlCs = @"
using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Data.Core;
using Avalonia.Data.Core.Plugins;
using Avalonia.Markup.Xaml;
using JianyingAutoClipper.App.ViewModels;
using JianyingAutoClipper.App.Views;
using JianyingAutoClipper.Core.Interfaces;
using JianyingAutoClipper.Core.Services;
using Microsoft.Extensions.DependencyInjection;

namespace JianyingAutoClipper.App;

public partial class App : Application
{
    public override void Initialize()
    {
        AvaloniaXamlLoader.Load(this);
    }

    public override void OnFrameworkInitializationCompleted()
    {
        var services = new ServiceCollection();
        ConfigureServices(services);
        var serviceProvider = services.BuildServiceProvider();

        if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            DisableAvaloniaDataAnnotationValidation();
            
            var mainWindow = new MainWindow
            {
                DataContext = serviceProvider.GetRequiredService<MainWindowViewModel>()
            };
            desktop.MainWindow = mainWindow;
        }

        base.OnFrameworkInitializationCompleted();
    }

    private void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton<ITemplateService, TemplateService>();
        services.AddSingleton<ITaskService, TaskService>();
        services.AddSingleton<IAutomationService, AutomationService>();
        services.AddTransient<MainWindowViewModel>();
    }

    private void DisableAvaloniaDataAnnotationValidation()
    {
        var dataValidationPluginsToRemove =
            BindingPlugins.DataValidators.OfType<DataAnnotationsValidationPlugin>().ToArray();

        foreach (var plugin in dataValidationPluginsToRemove)
        {
            BindingPlugins.DataValidators.Remove(plugin);
        }
    }
}
"@
$appAxamlCs | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.App\App.axaml.cs" -Encoding utf8
Write-Host "  ✓ App.axaml.cs" -ForegroundColor Gray

# 30. MainWindow.axaml
$mainWindowAxaml = @"
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        mc:Ignorable="d" d:DesignWidth="1200" d:DesignHeight="800"
        x:Class="JianyingAutoClipper.App.Views.MainWindow"
        Title="剪映自动剪辑">

    <Design.DataContext>
        <vm:MainWindowViewModel xmlns:vm="using:JianyingAutoClipper.App.ViewModels"/>
    </Design.DataContext>

    <Grid RowDefinitions="Auto,*,Auto">
        <Menu Grid.Row="0">
            <MenuItem Header="_文件">
                <MenuItem Header="_新建任务" Command="{Binding CreateNewTaskCommand}"/>
                <MenuItem Header="_新建模板" Command="{Binding CreateNewTemplateCommand}"/>
                <Separator/>
                <MenuItem Header="_退出"/>
            </MenuItem>
            <MenuItem Header="_工具">
                <MenuItem Header="_启动剪映" Command="{Binding LaunchJianyingCommand}"/>
            </MenuItem>
        </Menu>

        <Grid Grid.Row="1" ColumnDefinitions="300,*" Margin="8">
            <Border Grid.Column="0" BorderBrush="#E0E0E0" BorderThickness="1" CornerRadius="4" Padding="8">
                <Grid RowDefinitions="Auto,*">
                    <TextBlock Grid.Row="0" Text="任务列表" FontWeight="Bold" Margin="0,0,0,8"/>
                    <ListBox Grid.Row="1" ItemsSource="{Binding Tasks}" SelectedItem="{Binding SelectedTask}">
                        <ListBox.ItemTemplate>
                            <DataTemplate>
                                <StackPanel Margin="0,4">
                                    <TextBlock Text="{Binding Name}" FontWeight="Medium"/>
                                    <TextBlock Text="{Binding Status}" FontSize="12" Opacity="0.7"/>
                                    <ProgressBar Value="{Binding Progress}" Maximum="100" Height="4" Margin="0,4,0,0"/>
                                </StackPanel>
                            </DataTemplate>
                        </ListBox.ItemTemplate>
                    </ListBox>
                </Grid>
            </Border>

            <Border Grid.Column="1" BorderBrush="#E0E0E0" BorderThickness="1" CornerRadius="4" Padding="16" Margin="8,0,0,0">
                <Grid RowDefinitions="Auto,*,Auto">
                    <StackPanel Grid.Row="0" Orientation="Horizontal" Spacing="8" Margin="0,0,0,16">
                        <Button Content="开始" Command="{Binding StartTaskCommand}" IsEnabled="{Binding SelectedTask}" Background="#165DFF" Foreground="White" Padding="16,8"/>
                        <Button Content="暂停" Command="{Binding PauseTaskCommand}" IsEnabled="{Binding SelectedTask}" Padding="16,8"/>
                        <Button Content="停止" Command="{Binding StopTaskCommand}" IsEnabled="{Binding SelectedTask}" Padding="16,8"/>
                    </StackPanel>

                    <ScrollViewer Grid.Row="1">
                        <StackPanel Spacing="16">
                            <Border Background="#F5F5F5" CornerRadius="4" Padding="12">
                                <StackPanel>
                                    <TextBlock Text="剪映状态" FontWeight="Bold" Margin="0,0,0,8"/>
                                    <Grid ColumnDefinitions="Auto,*" RowDefinitions="Auto,Auto">
                                        <TextBlock Grid.Row="0" Grid.Column="0" Text="安装状态:" FontWeight="Medium" Margin="0,0,8,0"/>
                                        <TextBlock Grid.Row="0" Grid.Column="1" Text="{Binding IsJianyingInstalled, Converter={StaticResource BooleanToStringConverter}, ConverterParameter=已安装|未安装}"/>
                                        
                                        <TextBlock Grid.Row="1" Grid.Column="0" Text="运行状态:" FontWeight="Medium" Margin="0,8,8,0"/>
                                        <TextBlock Grid.Row="1" Grid.Column="1" Text="{Binding IsJianyingRunning, Converter={StaticResource BooleanToStringConverter}, ConverterParameter=运行中|未运行}" Margin="0,8,0,0"/>
                                    </Grid>
                                </StackPanel>
                            </Border>

                            <TextBlock Text="任务详情" FontWeight="Bold"/>
                            
                            <Border Background="#F9F9F9" CornerRadius="4" Padding="12">
                                <Grid ColumnDefinitions="Auto,*" RowDefinitions="Auto,Auto,Auto,Auto">
                                    <TextBlock Grid.Row="0" Grid.Column="0" Text="任务名称:" FontWeight="Medium" Margin="0,0,8,0"/>
                                    <TextBlock Grid.Row="0" Grid.Column="1" Text="{Binding SelectedTask.Name}"/>
                                    
                                    <TextBlock Grid.Row="1" Grid.Column="0" Text="状态:" FontWeight="Medium" Margin="0,8,8,0"/>
                                    <TextBlock Grid.Row="1" Grid.Column="1" Text="{Binding SelectedTask.Status}" Margin="0,8,0,0"/>
                                    
                                    <TextBlock Grid.Row="2" Grid.Column="0" Text="进度:" FontWeight="Medium" Margin="0,8,8,0"/>
                                    <TextBlock Grid.Row="2" Grid.Column="1" Text="{Binding SelectedTask.Progress, StringFormat={}{0:F1}%}" Margin="0,8,0,0"/>
                                    
                                    <TextBlock Grid.Row="3" Grid.Column="0" Text="视频数量:" FontWeight="Medium" Margin="0,8,8,0"/>
                                    <TextBlock Grid.Row="3" Grid.Column="1" Text="{Binding SelectedTask.VideoFiles.Count}" Margin="0,8,0,0"/>
                                </Grid>
                            </Border>
                        </StackPanel>
                    </ScrollViewer>
                </Grid>
            </Border>
        </Grid>

        <StatusBar Grid.Row="2">
            <StatusBarItem>
                <TextBlock Text="{Binding StatusMessage}"/>
            </StatusBarItem>
        </StatusBar>
    </Grid>
</Window>
"@
$mainWindowAxaml | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.App\Views\MainWindow.axaml" -Encoding utf8
Write-Host "  ✓ MainWindow.axaml" -ForegroundColor Gray

# 31. MainWindow.axaml.cs
$mainWindowAxamlCs = @"
using Avalonia.Controls;

namespace JianyingAutoClipper.App.Views;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }
}
"@
$mainWindowAxamlCs | Out-File -FilePath "$projectRoot\src\JianyingAutoClipper.App\Views\MainWindow.axaml.cs" -Encoding utf8
Write-Host "  ✓ MainWindow.axaml.cs" -ForegroundColor Gray

# 完成！
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ 项目创建完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "下一步操作：" -ForegroundColor Yellow
Write-Host "1. 进入项目目录: cd JianyingAutoClipper" -ForegroundColor White
Write-Host "2. 恢复依赖: dotnet restore" -ForegroundColor White
Write-Host "3. 构建项目: dotnet build" -ForegroundColor White
Write-Host "4. 运行应用: dotnet run --project src\JianyingAutoClipper.App" -ForegroundColor White
Write-Host ""
Write-Host "或者直接使用 Visual Studio 打开 JianyingAutoClipper.sln" -ForegroundColor Cyan
Write-Host ""

