namespace SmartCommerce.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; private set; }
    public Order Order { get; private set; } = null!;
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public string ProductName { get; private set; } = string.Empty;
    public string ProductSku { get; private set; } = string.Empty;
    public string? ProductImageUrl { get; private set; }
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal TotalPrice => UnitPrice * Quantity;

    private OrderItem() { }

    public static OrderItem Create(Guid orderId, Product product, int quantity) =>
        new()
        {
            OrderId = orderId,
            ProductId = product.Id,
            ProductName = product.Name,
            ProductSku = product.Sku,
            ProductImageUrl = product.ImageUrl,
            Quantity = quantity,
            UnitPrice = product.GetEffectivePrice()
        };
}
