
using System.Text.Json;
using JianyingAutoClipper.Core.Interfaces;
using JianyingAutoClipper.Core.Models;

namespace JianyingAutoClipper.Core.Services;

public class TemplateService : ITemplateService
{
    private readonly string _templatesDirectory;
    private readonly List&lt;ClipTemplate&gt; _templates = new();

    public TemplateService()
    {
        _templatesDirectory = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "JianyingAutoClipper",
            "Templates");
        
        if (!Directory.Exists(_templatesDirectory))
        {
            Directory.CreateDirectory(_templatesDirectory);
        }
        
        LoadTemplatesFromDisk();
    }

    public Task&lt;ClipTemplate&gt; CreateTemplateAsync(string name)
    {
        var template = new ClipTemplate
        {
            Name = name,
            CreatedAt = DateTime.Now
        };
        
        _templates.Add(template);
        return Task.FromResult(template);
    }

    public async Task&lt;ClipTemplate?&gt; LoadTemplateAsync(string filePath)
    {
        if (!File.Exists(filePath))
        {
            return null;
        }
        
        var json = await File.ReadAllTextAsync(filePath);
        var template = JsonSerializer.Deserialize&lt;ClipTemplate&gt;(json);
        return template;
    }

    public async Task SaveTemplateAsync(ClipTemplate template, string filePath)
    {
        template.UpdatedAt = DateTime.Now;
        var json = JsonSerializer.Serialize(template, new JsonSerializerOptions
        {
            WriteIndented = true
        });
        await File.WriteAllTextAsync(filePath, json);
    }

    public Task&lt;IEnumerable&lt;ClipTemplate&gt;&gt; GetTemplatesAsync()
    {
        return Task.FromResult(_templates.AsEnumerable());
    }

    public async Task DeleteTemplateAsync(Guid templateId)
    {
        var template = _templates.FirstOrDefault(t =&gt; t.Id == templateId);
        if (template != null)
        {
            _templates.Remove(template);
            var filePath = Path.Combine(_templatesDirectory, $"{templateId}.json");
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
        await Task.CompletedTask;
    }

    private void LoadTemplatesFromDisk()
    {
        var files = Directory.GetFiles(_templatesDirectory, "*.json");
        foreach (var file in files)
        {
            try
            {
                var json = File.ReadAllText(file);
                var template = JsonSerializer.Deserialize&lt;ClipTemplate&gt;(json);
                if (template != null)
                {
                    _templates.Add(template);
                }
            }
            catch
            {
            }
        }
    }
}

