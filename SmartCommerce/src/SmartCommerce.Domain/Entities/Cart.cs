namespace SmartCommerce.Domain.Entities;

public class Cart : BaseEntity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    public ICollection<CartItem> Items { get; private set; } = new List<CartItem>();
    public string? SessionId { get; private set; }
    public DateTime? ExpiresAt { get; private set; }

    public decimal SubTotal => Items.Sum(i => i.UnitPrice * i.Quantity);
    public int TotalItems => Items.Sum(i => i.Quantity);

    private Cart() { }

    public static Cart Create(Guid userId, string? sessionId = null) =>
        new()
        {
            UserId = userId,
            SessionId = sessionId,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };

    public CartItem AddItem(Product product, int quantity)
    {
        var existing = Items.FirstOrDefault(i => i.ProductId == product.Id);
        if (existing != null)
        {
            existing.UpdateQuantity(existing.Quantity + quantity);
            UpdatedAt = DateTime.UtcNow;
            return existing;
        }

        var item = CartItem.Create(Id, product, quantity);
        Items.Add(item);
        UpdatedAt = DateTime.UtcNow;
        return item;
    }

    public void UpdateItemQuantity(Guid productId, int quantity)
    {
        var item = Items.FirstOrDefault(i => i.ProductId == productId)
            ?? throw new InvalidOperationException("Item not found in cart.");

        if (quantity <= 0)
            Items.Remove(item);
        else
            item.UpdateQuantity(quantity);

        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveItem(Guid productId)
    {
        var item = Items.FirstOrDefault(i => i.ProductId == productId);
        if (item != null)
        {
            Items.Remove(item);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void Clear()
    {
        Items.Clear();
        UpdatedAt = DateTime.UtcNow;
    }
}
