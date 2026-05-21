
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

    public Task&lt;bool&gt; IsJianyingRunningAsync()
    {
        var processes = Process.GetProcessesByName(JianyingProcessName);
        return Task.FromResult(processes.Length &gt; 0);
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

    public Task&lt;bool&gt; VerifyJianyingInstallationAsync()
    {
        return Task.FromResult(!string.IsNullOrEmpty(_jianyingPath) &amp;&amp; File.Exists(_jianyingPath));
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

