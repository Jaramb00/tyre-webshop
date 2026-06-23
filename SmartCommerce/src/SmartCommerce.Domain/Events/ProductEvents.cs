namespace SmartCommerce.Domain.Events;

public record ProductCreatedEvent(Guid ProductId, string Name, decimal Price) : DomainEvent;
public record ProductUpdatedEvent(Guid ProductId, string Name, decimal Price) : DomainEvent;
public record InventoryUpdatedEvent(Guid ProductId, int NewQuantity, string? Reason) : DomainEvent;
public record LowStockAlertEvent(Guid ProductId, int CurrentStock, int Threshold) : DomainEvent;
