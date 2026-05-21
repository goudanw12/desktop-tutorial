
using System.Diagnostics;
using JianyingAutoClipper.Core.Models;

namespace JianyingAutoClipper.Infrastructure.Automation;

public class MacOSAutomationAdapter : IPlatformAutomationAdapter
{
    private const string JianyingBundleId = "com.bytedance.mac.jianyingpro";
    private const string JianyingAppName = "剪映专业版";

    public Task&lt;bool&gt; IsJianyingRunningAsync()
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

    public Task&lt;bool&gt; VerifyJianyingInstallationAsync()
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
                    Arguments = $"-e \"{script.Replace("\"", "\\\"")}\"",
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

