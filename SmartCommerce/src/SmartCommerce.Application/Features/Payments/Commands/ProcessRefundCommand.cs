using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Application.Features.Payments.DTOs;

namespace SmartCommerce.Application.Features.Payments.Commands;

public record ProcessRefundCommand(Guid PaymentId, decimal Amount, string Reason) : IRequest<RefundResponse>;

public class ProcessRefundCommandHandler : IRequestHandler<ProcessRefundCommand, RefundResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IPaymentService _paymentService;
    public ProcessRefundCommandHandler(IApplicationDbContext context, IPaymentService paymentService)
    {
        _context = context;
        _paymentService = paymentService;
    }

    public async Task<RefundResponse> Handle(ProcessRefundCommand request, CancellationToken cancellationToken)
    {
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.Id == request.PaymentId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Payment), request.PaymentId);

        if (payment.StripeChargeId is null)
            throw new BusinessRuleException("Payment has no associated charge to refund.");

        var refundId = await _paymentService.CreateRefundAsync(payment.StripeChargeId, request.Amount, cancellationToken);
        payment.ProcessRefund(request.Amount, refundId);
        await _context.SaveChangesAsync(cancellationToken);

        return new RefundResponse(refundId, request.Amount, "succeeded");
    }
}
