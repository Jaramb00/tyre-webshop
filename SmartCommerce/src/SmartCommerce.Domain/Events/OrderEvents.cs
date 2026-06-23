using SmartCommerce.Domain.Enums;

namespace SmartCommerce.Domain.Events;

public record OrderCreatedEvent(Guid OrderId, Guid UserId) : DomainEvent;
public record OrderStatusChangedEvent(Guid OrderId, OrderStatus OldStatus, OrderStatus NewStatus) : DomainEvent;
public record OrderShippedEvent(Guid OrderId, Guid UserId, string TrackingNumber) : DomainEvent;
public record OrderDeliveredEvent(Guid OrderId, Guid UserId) : DomainEvent;
public record OrderCancelledEvent(Guid OrderId, Guid UserId, string Reason) : DomainEvent;
