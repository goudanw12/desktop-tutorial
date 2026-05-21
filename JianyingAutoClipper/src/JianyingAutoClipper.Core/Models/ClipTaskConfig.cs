
namespace JianyingAutoClipper.Core.Models;

public class ClipTaskConfig
{
    public string Name { get; set; } = string.Empty;
    public List&lt;string&gt; VideoFiles { get; set; } = new();
    public Guid TemplateId { get; set; }
    public ExportSettings? ExportSettings { get; set; }
    public string OutputDirectory { get; set; } = string.Empty;
}

