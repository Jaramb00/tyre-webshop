namespace SmartCommerce.Domain.Entities;

public class CartItem : BaseEntity
{
    public Guid CartId { get; private set; }
    public Cart Cart { get; private set; } = null!;
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal TotalPrice => UnitPrice * Quantity;

    private CartItem() { }

    public static CartItem Create(Guid cartId, Product product, int quantity) =>
        new()
        {
            CartId = cartId,
            ProductId = product.Id,
            Quantity = quantity,
            UnitPrice = product.GetEffectivePrice()
        };

    public void UpdateQuantity(int quantity)
    {
        if (quantity <= 0) throw new ArgumentException("Quantity must be positive.");
        Quantity = quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RefreshPrice(decimal newPrice)
    {
        UnitPrice = newPrice;
        UpdatedAt = DateTime.UtcNow;
    }
}
