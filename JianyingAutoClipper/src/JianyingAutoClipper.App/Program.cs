
using Avalonia;
using System;

namespace JianyingAutoClipper.App;

class Program
{
    [STAThread]
    public static void Main(string[] args) =&gt; BuildAvaloniaApp()
        .StartWithClassicDesktopLifetime(args);

    public static AppBuilder BuildAvaloniaApp()
        =&gt; AppBuilder.Configure&lt;App&gt;()
            .UsePlatformDetect()
            .WithInterFont()
            .LogToTrace();
}

