
using JianyingAutoClipper.Core.Models;

namespace JianyingAutoClipper.Core.Interfaces;

public interface IAutomationService
{
    Task&lt;bool&gt; IsJianyingRunningAsync();
    Task LaunchJianyingAsync();
    Task CloseJianyingAsync();
    Task ImportVideoAsync(string videoPath);
    Task ApplyTemplateAsync(ClipTemplate template);
    Task ExportVideoAsync(string outputPath, ExportSettings settings);
    Task&lt;bool&gt; VerifyJianyingInstallationAsync();
}

