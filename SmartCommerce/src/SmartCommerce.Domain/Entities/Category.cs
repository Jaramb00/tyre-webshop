namespace SmartCommerce.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? ImageUrl { get; private set; }
    public int DisplayOrder { get; private set; }
    public bool IsActive { get; private set; } = true;
    public Guid? ParentCategoryId { get; private set; }
    public Category? ParentCategory { get; private set; }
    public ICollection<Category> SubCategories { get; private set; } = new List<Category>();
    public ICollection<Product> Products { get; private set; } = new List<Product>();

    private Category() { }

    public static Category Create(string name, string? description = null, Guid? parentCategoryId = null) =>
        new()
        {
            Name = name,
            Slug = name.ToLower().Replace(" ", "-"),
            Description = description,
            ParentCategoryId = parentCategoryId
        };

    public void Update(string name, string? description, string? imageUrl, int displayOrder)
    {
        Name = name;
        Slug = name.ToLower().Replace(" ", "-");
        Description = description;
        ImageUrl = imageUrl;
        DisplayOrder = displayOrder;
        UpdatedAt = DateTime.UtcNow;
    }
}
