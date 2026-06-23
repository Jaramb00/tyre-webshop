namespace SmartCommerce.Application.Features.Payments.DTOs;

public record PaymentIntentResponse(
    string ClientSecret,
    Guid PaymentId,
    decimal Amount,
    string Currency);

public record ConfirmPaymentCommand(
    string PaymentIntentId,
    string ChargeId,
    Guid OrderId) : MediatR.IRequest;

public record RefundRequest(Guid PaymentId, decimal Amount, string Reason);
public record RefundResponse(string RefundId, decimal Amount, string Status);
