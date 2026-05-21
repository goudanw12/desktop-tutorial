
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
    private ObservableCollection&lt;ClipTask&gt; _tasks = new();

    [ObservableProperty]
    private ObservableCollection&lt;ClipTemplate&gt; _templates = new();

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
        StatusMessage = $"正在执行任务: {SelectedTask.Name}";
    }

    [RelayCommand]
    private async Task PauseTaskAsync()
    {
        if (SelectedTask == null) return;
        
        await _taskService.PauseTaskAsync(SelectedTask.Id);
        StatusMessage = $"已暂停任务: {SelectedTask.Name}";
    }

    [RelayCommand]
    private async Task StopTaskAsync()
    {
        if (SelectedTask == null) return;
        
        await _taskService.StopTaskAsync(SelectedTask.Id);
        StatusMessage = $"已停止任务: {SelectedTask.Name}";
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
            StatusMessage = $"启动剪映失败: {ex.Message}";
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
        var task = Tasks.FirstOrDefault(t =&gt; t.Id == e.TaskId);
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

