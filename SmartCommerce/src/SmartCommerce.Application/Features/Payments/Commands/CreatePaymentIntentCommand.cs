using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Application.Features.Payments.DTOs;
using SmartCommerce.Domain.Entities;
using SmartCommerce.Domain.Enums;

namespace SmartCommerce.Application.Features.Payments.Commands;

public record CreatePaymentIntentCommand(Guid OrderId, Guid UserId) : IRequest<PaymentIntentResponse>;

public class CreatePaymentIntentCommandHandler : IRequestHandler<CreatePaymentIntentCommand, PaymentIntentResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IPaymentService _paymentService;
    public CreatePaymentIntentCommandHandler(IApplicationDbContext context, IPaymentService paymentService)
    {
        _context = context;
        _paymentService = paymentService;
    }

    public async Task<PaymentIntentResponse> Handle(CreatePaymentIntentCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && o.UserId == request.UserId, cancellationToken)
            ?? throw new NotFoundException(nameof(Order), request.OrderId);

        if (order.Payment != null && order.Payment.Status == PaymentStatus.Completed)
            throw new BusinessRuleException("Order is already paid.");

        var clientSecret = await _paymentService.CreatePaymentIntentAsync(
            order.Total, order.Currency, order.Id.ToString(), cancellationToken);

        var payment = Payment.Create(order.Id, order.Total, PaymentMethod.Stripe, order.Currency);
        payment.SetStripePaymentIntent(clientSecret.Split("_secret_")[0]);

        await _context.Payments.AddAsync(payment, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new PaymentIntentResponse(clientSecret, payment.Id, order.Total, order.Currency);
    }
}
