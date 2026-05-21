
namespace JianyingAutoClipper.Core.Models;

public class ExportSettings
{
    public string OutputFormat { get; set; } = "mp4";
    public int ResolutionWidth { get; set; } = 1920;
    public int ResolutionHeight { get; set; } = 1080;
    public int Bitrate { get; set; } = 8000;
    public int FrameRate { get; set; } = 30;
}

