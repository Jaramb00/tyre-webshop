using SmartCommerce.Domain.Enums;
using SmartCommerce.Domain.Events;

namespace SmartCommerce.Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; private set; } = string.Empty;
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public decimal Subtotal { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal ShippingCost { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal Total { get; private set; }
    public string Currency { get; private set; } = "USD";
    public string? Notes { get; private set; }
    public string? CancellationReason { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public DateTime? ShippedAt { get; private set; }
    public DateTime? DeliveredAt { get; private set; }
    public Guid? CouponId { get; private set; }
    public Coupon? Coupon { get; private set; }

    public Address ShippingAddress { get; private set; } = null!;
    public Address BillingAddress { get; private set; } = null!;

    public ICollection<OrderItem> Items { get; private set; } = new List<OrderItem>();
    public Payment? Payment { get; private set; }
    public Shipment? Shipment { get; private set; }

    private Order() { }

    public static Order Create(Guid userId, Address shippingAddress, Address billingAddress, string currency = "USD")
    {
        var order = new Order
        {
            OrderNumber = GenerateOrderNumber(),
            UserId = userId,
            ShippingAddress = shippingAddress,
            BillingAddress = billingAddress,
            Currency = currency,
            Status = OrderStatus.Pending
        };

        order.AddDomainEvent(new OrderCreatedEvent(order.Id, userId));
        return order;
    }

    public void AddItem(OrderItem item)
    {
        Items.Add(item);
        RecalculateTotals();
    }

    public void ApplyCoupon(Coupon coupon)
    {
        CouponId = coupon.Id;
        Coupon = coupon;
        DiscountAmount = coupon.CalculateDiscount(Subtotal);
        RecalculateTotals();
    }

    public void SetShipping(decimal shippingCost)
    {
        ShippingCost = shippingCost;
        RecalculateTotals();
    }

    public void SetTax(decimal taxRate)
    {
        TaxAmount = Subtotal * taxRate;
        RecalculateTotals();
    }

    public void Confirm()
    {
        if (Status != OrderStatus.Pending)
            throw new InvalidOperationException($"Cannot confirm order in status: {Status}");

        Status = OrderStatus.Confirmed;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new OrderStatusChangedEvent(Id, OrderStatus.Pending, OrderStatus.Confirmed));
    }

    public void MarkAsProcessing()
    {
        Status = OrderStatus.Processing;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new OrderStatusChangedEvent(Id, OrderStatus.Confirmed, OrderStatus.Processing));
    }

    public void MarkAsShipped(string trackingNumber)
    {
        Status = OrderStatus.Shipped;
        ShippedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new OrderShippedEvent(Id, UserId, trackingNumber));
    }

    public void MarkAsDelivered()
    {
        Status = OrderStatus.Delivered;
        DeliveredAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new OrderDeliveredEvent(Id, UserId));
    }

    public void Cancel(string reason)
    {
        if (Status is OrderStatus.Shipped or OrderStatus.Delivered)
            throw new InvalidOperationException("Cannot cancel a shipped or delivered order.");

        var previousStatus = Status;
        Status = OrderStatus.Cancelled;
        CancellationReason = reason;
        CancelledAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new OrderCancelledEvent(Id, UserId, reason));
    }

    private void RecalculateTotals()
    {
        Subtotal = Items.Sum(i => i.UnitPrice * i.Quantity);
        Total = Subtotal + TaxAmount + ShippingCost - DiscountAmount;
    }

    private static string GenerateOrderNumber() =>
        $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
}
