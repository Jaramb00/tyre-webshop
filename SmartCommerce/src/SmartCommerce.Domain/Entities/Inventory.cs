using SmartCommerce.Domain.Events;

namespace SmartCommerce.Domain.Entities;

public class Inventory : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public int QuantityInStock { get; private set; }
    public int QuantityReserved { get; private set; }
    public int LowStockThreshold { get; private set; } = 10;
    public int? ReorderPoint { get; private set; }
    public int? ReorderQuantity { get; private set; }
    public string? WarehouseLocation { get; private set; }
    public bool TrackInventory { get; private set; } = true;
    public bool AllowBackorder { get; private set; }

    public int AvailableQuantity => QuantityInStock - QuantityReserved;
    public bool IsLowStock => QuantityInStock <= LowStockThreshold;
    public bool IsOutOfStock => AvailableQuantity <= 0;

    private Inventory() { }

    public static Inventory Create(Guid productId, int initialQuantity, int lowStockThreshold = 10) =>
        new()
        {
            ProductId = productId,
            QuantityInStock = initialQuantity,
            LowStockThreshold = lowStockThreshold
        };

    public void AddStock(int quantity, string? reason = null)
    {
        if (quantity <= 0) throw new ArgumentException("Quantity must be positive.");
        QuantityInStock += quantity;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new InventoryUpdatedEvent(ProductId, QuantityInStock, reason));
    }

    public void RemoveStock(int quantity)
    {
        if (quantity <= 0) throw new ArgumentException("Quantity must be positive.");
        if (quantity > AvailableQuantity && !AllowBackorder)
            throw new InvalidOperationException($"Insufficient stock. Available: {AvailableQuantity}, Requested: {quantity}");

        QuantityInStock -= quantity;
        UpdatedAt = DateTime.UtcNow;

        if (IsLowStock)
            AddDomainEvent(new LowStockAlertEvent(ProductId, QuantityInStock, LowStockThreshold));
    }

    public void ReserveStock(int quantity)
    {
        if (quantity > AvailableQuantity && !AllowBackorder)
            throw new InvalidOperationException("Insufficient stock to reserve.");
        QuantityReserved += quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ReleaseReservation(int quantity)
    {
        QuantityReserved = Math.Max(0, QuantityReserved - quantity);
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateThresholds(int lowStockThreshold, int? reorderPoint, int? reorderQuantity)
    {
        LowStockThreshold = lowStockThreshold;
        ReorderPoint = reorderPoint;
        ReorderQuantity = reorderQuantity;
        UpdatedAt = DateTime.UtcNow;
    }
}
