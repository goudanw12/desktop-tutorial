
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
                DataContext = serviceProvider.GetRequiredService&lt;MainWindowViewModel&gt;()
            };
            desktop.MainWindow = mainWindow;
        }

        base.OnFrameworkInitializationCompleted();
    }

    private void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton&lt;ITemplateService, TemplateService&gt;();
        services.AddSingleton&lt;ITaskService, TaskService&gt;();
        services.AddSingleton&lt;IAutomationService, AutomationService&gt;();
        services.AddTransient&lt;MainWindowViewModel&gt;();
    }

    private void DisableAvaloniaDataAnnotationValidation()
    {
        var dataValidationPluginsToRemove =
            BindingPlugins.DataValidators.OfType&lt;DataAnnotationsValidationPlugin&gt;().ToArray();

        foreach (var plugin in dataValidationPluginsToRemove)
        {
            BindingPlugins.DataValidators.Remove(plugin);
        }
    }
}

