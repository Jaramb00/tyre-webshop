using SmartCommerce.Domain.Entities;

namespace SmartCommerce.Application.Features.Orders.DTOs;

public record OrderDto(
    Guid Id,
    string OrderNumber,
    string Status,
    decimal Subtotal,
    decimal TaxAmount,
    decimal ShippingCost,
    decimal DiscountAmount,
    decimal Total,
    string Currency,
    string? Notes,
    DateTime CreatedAt,
    DateTime? ShippedAt,
    DateTime? DeliveredAt,
    DateTime? CancelledAt,
    string? CancellationReason,
    AddressDto ShippingAddress,
    AddressDto BillingAddress,
    List<OrderItemDto> Items,
    PaymentSummaryDto? Payment,
    ShipmentSummaryDto? Shipment);

public record OrderItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string ProductSku,
    string? ProductImageUrl,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice);

public record AddressDto(
    string FullName,
    string Line1,
    string? Line2,
    string City,
    string State,
    string PostalCode,
    string Country,
    string? PhoneNumber);

public record PaymentSummaryDto(
    Guid Id,
    string Status,
    string Method,
    decimal Amount,
    string Currency,
    DateTime? PaidAt);

public record ShipmentSummaryDto(
    Guid Id,
    string? TrackingNumber,
    string? Carrier,
    string Status,
    DateTime? EstimatedDelivery,
    DateTime? ShippedAt,
    DateTime? DeliveredAt);

public record CreateOrderDto(
    AddressDto ShippingAddress,
    AddressDto BillingAddress,
    string? CouponCode,
    string Currency = "USD",
    string? Notes = null);

public record OrderSummaryDto(
    Guid Id,
    string OrderNumber,
    string Status,
    decimal Total,
    int ItemCount,
    DateTime CreatedAt,
    DateTime? DeliveredAt);
