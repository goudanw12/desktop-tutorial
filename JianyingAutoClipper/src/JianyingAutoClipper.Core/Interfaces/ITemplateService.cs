
using JianyingAutoClipper.Core.Models;

namespace JianyingAutoClipper.Core.Interfaces;

public interface ITemplateService
{
    Task&lt;ClipTemplate&gt; CreateTemplateAsync(string name);
    Task&lt;ClipTemplate?&gt; LoadTemplateAsync(string filePath);
    Task SaveTemplateAsync(ClipTemplate template, string filePath);
    Task&lt;IEnumerable&lt;ClipTemplate&gt;&gt; GetTemplatesAsync();
    Task DeleteTemplateAsync(Guid templateId);
}

