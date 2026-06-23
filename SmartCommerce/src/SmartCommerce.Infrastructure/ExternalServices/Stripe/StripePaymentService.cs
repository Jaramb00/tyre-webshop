using Microsoft.Extensions.Options;
using SmartCommerce.Application.Common.Interfaces;
using Stripe;
using Stripe.Checkout;

namespace SmartCommerce.Infrastructure.ExternalServices.Stripe;

public class StripeSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public string PublishableKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
}

public class StripePaymentService : IPaymentService
{
    public StripePaymentService(IOptions<StripeSettings> options)
    {
        StripeConfiguration.ApiKey = options.Value.SecretKey;
    }

    public async Task<string> CreatePaymentIntentAsync(decimal amount, string currency, string orderId, CancellationToken cancellationToken = default)
    {
        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(amount * 100),
            Currency = currency.ToLower(),
            Metadata = new Dictionary<string, string> { { "orderId", orderId } },
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions { Enabled = true }
        };

        var service = new PaymentIntentService();
        var intent = await service.CreateAsync(options, cancellationToken: cancellationToken);
        return intent.ClientSecret;
    }

    public async Task<string> CreateCheckoutSessionAsync(Guid orderId, string successUrl, string cancelUrl, CancellationToken cancellationToken = default)
    {
        var sessionOptions = new SessionCreateOptions
        {
            Mode = "payment",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            Metadata = new Dictionary<string, string> { { "orderId", orderId.ToString() } }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(sessionOptions, cancellationToken: cancellationToken);
        return session.Url;
    }

    public async Task<bool> ConfirmPaymentAsync(string paymentIntentId, CancellationToken cancellationToken = default)
    {
        var service = new PaymentIntentService();
        var intent = await service.GetAsync(paymentIntentId, cancellationToken: cancellationToken);
        return intent.Status == "succeeded";
    }

    public async Task<string> CreateRefundAsync(string chargeId, decimal amount, CancellationToken cancellationToken = default)
    {
        var options = new RefundCreateOptions
        {
            Charge = chargeId,
            Amount = (long)(amount * 100)
        };

        var service = new RefundService();
        var refund = await service.CreateAsync(options, cancellationToken: cancellationToken);
        return refund.Id;
    }
}
