using SmartCommerce.Domain.Enums;

namespace SmartCommerce.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid OrderId { get; private set; }
    public Order Order { get; private set; } = null!;
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "USD";
    public PaymentStatus Status { get; private set; } = PaymentStatus.Pending;
    public PaymentMethod Method { get; private set; }
    public string? StripePaymentIntentId { get; private set; }
    public string? StripeChargeId { get; private set; }
    public string? StripeRefundId { get; private set; }
    public string? TransactionId { get; private set; }
    public string? FailureReason { get; private set; }
    public DateTime? PaidAt { get; private set; }
    public DateTime? RefundedAt { get; private set; }
    public decimal? RefundedAmount { get; private set; }

    private Payment() { }

    public static Payment Create(Guid orderId, decimal amount, PaymentMethod method, string currency = "USD") =>
        new()
        {
            OrderId = orderId,
            Amount = amount,
            Method = method,
            Currency = currency,
            Status = PaymentStatus.Pending
        };

    public void SetStripePaymentIntent(string paymentIntentId)
    {
        StripePaymentIntentId = paymentIntentId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsPaid(string chargeId, string transactionId)
    {
        StripeChargeId = chargeId;
        TransactionId = transactionId;
        Status = PaymentStatus.Completed;
        PaidAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsFailed(string reason)
    {
        Status = PaymentStatus.Failed;
        FailureReason = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ProcessRefund(decimal amount, string refundId)
    {
        if (amount > Amount) throw new InvalidOperationException("Refund exceeds payment amount.");
        Status = amount == Amount ? PaymentStatus.Refunded : PaymentStatus.PartiallyRefunded;
        RefundedAmount = amount;
        StripeRefundId = refundId;
        RefundedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
