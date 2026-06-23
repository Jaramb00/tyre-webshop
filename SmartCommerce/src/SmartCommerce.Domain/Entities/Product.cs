using SmartCommerce.Domain.Enums;
using SmartCommerce.Domain.Events;

namespace SmartCommerce.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string? ShortDescription { get; private set; }
    public decimal Price { get; private set; }
    public decimal? CompareAtPrice { get; private set; }
    public decimal CostPrice { get; private set; }
    public string Sku { get; private set; } = string.Empty;
    public string? Barcode { get; private set; }
    public decimal Weight { get; private set; }
    public string? ImageUrl { get; private set; }
    public List<string> ImageUrls { get; private set; } = new();
    public bool IsActive { get; private set; } = true;
    public bool IsFeatured { get; private set; }
    public ProductStatus Status { get; private set; } = ProductStatus.Draft;
    public int LowStockThreshold { get; private set; } = 10;
    public string? MetaTitle { get; private set; }
    public string? MetaDescription { get; private set; }
    public decimal? DiscountPercentage { get; private set; }

    public Guid CategoryId { get; private set; }
    public Category Category { get; private set; } = null!;
    public Guid BrandId { get; private set; }
    public Brand Brand { get; private set; } = null!;
    public Inventory? Inventory { get; private set; }
    public ICollection<Review> Reviews { get; private set; } = new List<Review>();
    public ICollection<OrderItem> OrderItems { get; private set; } = new List<OrderItem>();
    public ICollection<CartItem> CartItems { get; private set; } = new List<CartItem>();

    private Product() { }

    public static Product Create(
        string name,
        string description,
        decimal price,
        decimal costPrice,
        string sku,
        Guid categoryId,
        Guid brandId,
        decimal weight = 0)
    {
        var product = new Product
        {
            Name = name,
            Slug = GenerateSlug(name),
            Description = description,
            Price = price,
            CostPrice = costPrice,
            Sku = sku,
            CategoryId = categoryId,
            BrandId = brandId,
            Weight = weight,
            Status = ProductStatus.Draft
        };

        product.AddDomainEvent(new ProductCreatedEvent(product.Id, name, price));
        return product;
    }

    public void UpdateDetails(
        string name,
        string description,
        string? shortDescription,
        decimal price,
        decimal? compareAtPrice,
        decimal costPrice,
        string? imageUrl,
        List<string>? imageUrls)
    {
        Name = name;
        Slug = GenerateSlug(name);
        Description = description;
        ShortDescription = shortDescription;
        Price = price;
        CompareAtPrice = compareAtPrice;
        CostPrice = costPrice;
        ImageUrl = imageUrl;
        if (imageUrls != null) ImageUrls = imageUrls;
        UpdatedAt = DateTime.UtcNow;

        AddDomainEvent(new ProductUpdatedEvent(Id, name, price));
    }

    public void Publish()
    {
        Status = ProductStatus.Active;
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Archive()
    {
        Status = ProductStatus.Archived;
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetFeatured(bool featured)
    {
        IsFeatured = featured;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDiscount(decimal? discountPercentage)
    {
        if (discountPercentage.HasValue && (discountPercentage < 0 || discountPercentage > 100))
            throw new ArgumentException("Discount must be between 0 and 100.");

        DiscountPercentage = discountPercentage;
        CompareAtPrice = discountPercentage.HasValue ? Price : null;
        if (discountPercentage.HasValue)
            Price = Price * (1 - discountPercentage.Value / 100);
        UpdatedAt = DateTime.UtcNow;
    }

    public decimal GetEffectivePrice() =>
        DiscountPercentage.HasValue
            ? Price * (1 - DiscountPercentage.Value / 100)
            : Price;

    public double GetAverageRating() =>
        Reviews.Any() ? Reviews.Average(r => r.Rating) : 0;

    private static string GenerateSlug(string name) =>
        name.ToLower()
            .Replace(" ", "-")
            .Replace("'", "")
            .Replace("\"", "")
            .Trim('-');
}
