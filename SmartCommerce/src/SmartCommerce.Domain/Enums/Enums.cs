namespace SmartCommerce.Domain.Enums;

public enum OrderStatus
{
    Pending = 1,
    Confirmed = 2,
    Processing = 3,
    Shipped = 4,
    Delivered = 5,
    Cancelled = 6,
    Refunded = 7,
    OnHold = 8
}

public enum PaymentStatus
{
    Pending = 1,
    Processing = 2,
    Completed = 3,
    Failed = 4,
    Cancelled = 5,
    Refunded = 6,
    PartiallyRefunded = 7
}

public enum PaymentMethod
{
    CreditCard = 1,
    DebitCard = 2,
    PayPal = 3,
    BankTransfer = 4,
    Stripe = 5,
    CashOnDelivery = 6
}

public enum ProductStatus
{
    Draft = 1,
    Active = 2,
    Archived = 3,
    OutOfStock = 4
}

public enum ShipmentStatus
{
    Pending = 1,
    Processing = 2,
    InTransit = 3,
    OutForDelivery = 4,
    Delivered = 5,
    Failed = 6,
    Returned = 7
}

public enum DiscountType
{
    Percentage = 1,
    FixedAmount = 2
}

public enum NotificationType
{
    OrderPlaced = 1,
    OrderConfirmed = 2,
    OrderShipped = 3,
    OrderDelivered = 4,
    OrderCancelled = 5,
    PaymentReceived = 6,
    PaymentFailed = 7,
    LowStock = 8,
    NewReview = 9,
    SystemAlert = 10,
    PromotionalOffer = 11
}

public enum UserRole
{
    Customer = 1,
    Admin = 2,
    WarehouseWorker = 3,
    Manager = 4
}
