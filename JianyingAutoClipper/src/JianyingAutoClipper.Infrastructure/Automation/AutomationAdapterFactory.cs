
using System.Runtime.InteropServices;

namespace JianyingAutoClipper.Infrastructure.Automation;

public static class AutomationAdapterFactory
{
    public static IPlatformAutomationAdapter CreateAdapter()
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            return new WindowsAutomationAdapter();
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
        {
            return new MacOSAutomationAdapter();
        }
        
        throw new PlatformNotSupportedException("当前平台不支持");
    }
}

