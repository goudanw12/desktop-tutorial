
namespace JianyingAutoClipper.Core.Models;

public class ClipAction
{
    public ClipActionType Type { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan Duration { get; set; }
    public Dictionary&lt;string, object&gt; Parameters { get; set; } = new();
}

