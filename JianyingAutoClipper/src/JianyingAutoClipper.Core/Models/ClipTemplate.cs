
namespace JianyingAutoClipper.Core.Models;

public class ClipTemplate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List&lt;ClipAction&gt; Actions { get; set; } = new();
    public TimeSpan DefaultDuration { get; set; } = TimeSpan.FromSeconds(60);
    public ExportSettings DefaultExportSettings { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }
}

