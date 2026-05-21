
namespace JianyingAutoClipper.Core.Models;

public class TaskProgressEventArgs : EventArgs
{
    public Guid TaskId { get; set; }
    public double Progress { get; set; }
    public string Message { get; set; } = string.Empty;
    public ClipTaskStatus? NewStatus { get; set; }
}

