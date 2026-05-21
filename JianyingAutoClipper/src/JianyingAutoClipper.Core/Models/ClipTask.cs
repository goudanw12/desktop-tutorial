
namespace JianyingAutoClipper.Core.Models;

public class ClipTask
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public ClipTaskStatus Status { get; set; } = ClipTaskStatus.Pending;
    public List&lt;string&gt; VideoFiles { get; set; } = new();
    public ClipTemplate? Template { get; set; }
    public ExportSettings ExportSettings { get; set; } = new();
    public double Progress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public string OutputDirectory { get; set; } = string.Empty;
}

