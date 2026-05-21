
using JianyingAutoClipper.Core.Interfaces;
using JianyingAutoClipper.Core.Models;

namespace JianyingAutoClipper.Core.Services;

public class TaskService : ITaskService
{
    private readonly List&lt;ClipTask&gt; _tasks = new();
    private readonly ITemplateService _templateService;
    private readonly IAutomationService _automationService;
    private readonly Dictionary&lt;Guid, CancellationTokenSource&gt; _cancellationTokens = new();

    public event EventHandler&lt;TaskProgressEventArgs&gt;? TaskProgress;

    public TaskService(ITemplateService templateService, IAutomationService automationService)
    {
        _templateService = templateService;
        _automationService = automationService;
    }

    public async Task&lt;ClipTask&gt; CreateTaskAsync(ClipTaskConfig config)
    {
        var templates = await _templateService.GetTemplatesAsync();
        var template = templates.FirstOrDefault(t =&gt; t.Id == config.TemplateId);
        
        var task = new ClipTask
        {
            Name = config.Name,
            VideoFiles = new List&lt;string&gt;(config.VideoFiles),
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
        var task = _tasks.FirstOrDefault(t =&gt; t.Id == taskId);
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
            OnTaskProgress(task, task.Progress, $"任务失败: {ex.Message}");
        }
        finally
        {
            _cancellationTokens.Remove(taskId);
        }
    }

    public Task PauseTaskAsync(Guid taskId)
    {
        var task = _tasks.FirstOrDefault(t =&gt; t.Id == taskId);
        if (task != null &amp;&amp; task.Status == ClipTaskStatus.Running)
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

    public Task&lt;IEnumerable&lt;ClipTask&gt;&gt; GetTasksAsync()
    {
        return Task.FromResult(_tasks.AsEnumerable());
    }

    public Task&lt;ClipTask?&gt; GetTaskAsync(Guid taskId)
    {
        var task = _tasks.FirstOrDefault(t =&gt; t.Id == taskId);
        return Task.FromResult(task);
    }

    public Task DeleteTaskAsync(Guid taskId)
    {
        var task = _tasks.FirstOrDefault(t =&gt; t.Id == taskId);
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
        for (int i = 0; i &lt; totalVideos; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var videoFile = task.VideoFiles[i];
            var progress = (double)(i * 100) / totalVideos;
            
            OnTaskProgress(task, progress, $"正在处理视频 {i + 1}/{totalVideos}: {Path.GetFileName(videoFile)}");

            await _automationService.ImportVideoAsync(videoFile);
            
            if (task.Template != null)
            {
                await _automationService.ApplyTemplateAsync(task.Template);
            }

            var outputFileName = $"edited_{Path.GetFileNameWithoutExtension(videoFile)}.{task.ExportSettings.OutputFormat}";
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

