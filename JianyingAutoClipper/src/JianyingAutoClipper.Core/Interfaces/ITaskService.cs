
using JianyingAutoClipper.Core.Models;

namespace JianyingAutoClipper.Core.Interfaces;

public interface ITaskService
{
    Task&lt;ClipTask&gt; CreateTaskAsync(ClipTaskConfig config);
    Task StartTaskAsync(Guid taskId);
    Task PauseTaskAsync(Guid taskId);
    Task StopTaskAsync(Guid taskId);
    Task&lt;IEnumerable&lt;ClipTask&gt;&gt; GetTasksAsync();
    Task&lt;ClipTask?&gt; GetTaskAsync(Guid taskId);
    Task DeleteTaskAsync(Guid taskId);
    event EventHandler&lt;TaskProgressEventArgs&gt; TaskProgress;
}

