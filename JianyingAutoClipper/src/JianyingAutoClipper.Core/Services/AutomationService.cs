
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

    public Task&lt;bool&gt; IsJianyingRunningAsync()
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

    public Task&lt;bool&gt; VerifyJianyingInstallationAsync()
    {
        return _adapter.VerifyJianyingInstallationAsync();
    }
}

