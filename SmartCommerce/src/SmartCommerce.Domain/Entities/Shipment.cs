using SmartCommerce.Domain.Enums;

namespace SmartCommerce.Domain.Entities;

public class Shipment : BaseEntity
{
    public Guid OrderId { get; private set; }
    public Order Order { get; private set; } = null!;
    public string? TrackingNumber { get; private set; }
    public string? Carrier { get; private set; }
    public ShipmentStatus Status { get; private set; } = ShipmentStatus.Pending;
    public Address? FromAddress { get; private set; }
    public Address ToAddress { get; private set; } = null!;
    public DateTime? EstimatedDelivery { get; private set; }
    public DateTime? ShippedAt { get; private set; }
    public DateTime? DeliveredAt { get; private set; }
    public decimal Weight { get; private set; }
    public string? Notes { get; private set; }
    public string? WeatherCondition { get; private set; }

    private Shipment() { }

    public static Shipment Create(Guid orderId, Address toAddress, decimal weight) =>
        new()
        {
            OrderId = orderId,
            ToAddress = toAddress,
            Weight = weight
        };

    public void SetTracking(string trackingNumber, string carrier, DateTime? estimatedDelivery)
    {
        TrackingNumber = trackingNumber;
        Carrier = carrier;
        EstimatedDelivery = estimatedDelivery;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsShipped()
    {
        Status = ShipmentStatus.InTransit;
        ShippedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsDelivered()
    {
        Status = ShipmentStatus.Delivered;
        DeliveredAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetWeatherCondition(string condition)
    {
        WeatherCondition = condition;
        UpdatedAt = DateTime.UtcNow;
    }
}
