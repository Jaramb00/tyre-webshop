namespace SmartCommerce.Domain.Entities;

public class Brand : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? LogoUrl { get; private set; }
    public string? WebsiteUrl { get; private set; }
    public bool IsActive { get; private set; } = true;
    public ICollection<Product> Products { get; private set; } = new List<Product>();

    private Brand() { }

    public static Brand Create(string name, string? description = null, string? logoUrl = null) =>
        new()
        {
            Name = name,
            Slug = name.ToLower().Replace(" ", "-"),
            Description = description,
            LogoUrl = logoUrl
        };

    public void Update(string name, string? description, string? logoUrl, string? websiteUrl)
    {
        Name = name;
        Slug = name.ToLower().Replace(" ", "-");
        Description = description;
        LogoUrl = logoUrl;
        WebsiteUrl = websiteUrl;
        UpdatedAt = DateTime.UtcNow;
    }
}
