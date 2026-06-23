using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Application.Features.Payments.Commands;
using SmartCommerce.Application.Features.Payments.DTOs;

namespace SmartCommerce.API.Controllers.V1;

/// <summary>Payment processing endpoints</summary>
[Authorize]
public class PaymentsController : BaseController
{
    private readonly ICurrentUserService _currentUser;
    public PaymentsController(ICurrentUserService currentUser) { _currentUser = currentUser; }

    /// <summary>Create a Stripe payment intent for an order</summary>
    [HttpPost("intent")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(typeof(PaymentIntentResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentRequest request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();
        var result = await Sender.Send(new CreatePaymentIntentCommand(request.OrderId, userId), cancellationToken);
        return Ok(result);
    }

    /// <summary>Confirm payment (Stripe webhook callback)</summary>
    [HttpPost("confirm")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentCommand command, CancellationToken cancellationToken)
    {
        await Sender.Send(command, cancellationToken);
        return Ok();
    }

    /// <summary>Request a refund (Admin only)</summary>
    [HttpPost("{paymentId:guid}/refund")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(RefundResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Refund(Guid paymentId, [FromBody] RefundRequest request, CancellationToken cancellationToken)
    {
        var result = await Sender.Send(new ProcessRefundCommand(paymentId, request.Amount, request.Reason), cancellationToken);
        return Ok(result);
    }
}

public record CreatePaymentIntentRequest(Guid OrderId);
