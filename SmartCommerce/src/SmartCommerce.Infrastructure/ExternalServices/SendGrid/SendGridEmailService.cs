using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using SmartCommerce.Application.Common.Interfaces;

namespace SmartCommerce.Infrastructure.ExternalServices.SendGrid;

public class SendGridSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "noreply@smartcommerce.com";
    public string FromName { get; set; } = "SmartCommerce";
}

public class SendGridEmailService : IEmailService
{
    private readonly SendGridSettings _settings;
    private readonly ILogger<SendGridEmailService> _logger;
    public SendGridEmailService(IOptions<SendGridSettings> options, ILogger<SendGridEmailService> logger)
    {
        _settings = options.Value;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = true, CancellationToken cancellationToken = default)
    {
        var client = new SendGridClient(_settings.ApiKey);
        var msg = new SendGridMessage
        {
            From = new EmailAddress(_settings.FromEmail, _settings.FromName),
            Subject = subject
        };
        msg.AddTo(new EmailAddress(to));

        if (isHtml)
            msg.HtmlContent = body;
        else
            msg.PlainTextContent = body;

        var response = await client.SendEmailAsync(msg, cancellationToken);
        if (!response.IsSuccessStatusCode)
            _logger.LogError("Failed to send email to {To}. Status: {Status}", to, response.StatusCode);
    }

    public async Task SendOrderConfirmationAsync(string to, string orderNumber, decimal total, CancellationToken cancellationToken = default)
        => await SendEmailAsync(to, $"Order Confirmed - #{orderNumber}",
            $"<h1>Thank you for your order!</h1><p>Order <strong>#{orderNumber}</strong> has been confirmed. Total: <strong>${total:F2}</strong></p>",
            cancellationToken: cancellationToken);

    public async Task SendOrderShippedAsync(string to, string orderNumber, string trackingNumber, CancellationToken cancellationToken = default)
        => await SendEmailAsync(to, $"Your Order #{orderNumber} Has Shipped",
            $"<h1>Your order is on the way!</h1><p>Tracking number: <strong>{trackingNumber}</strong></p>",
            cancellationToken: cancellationToken);

    public async Task SendPasswordResetAsync(string to, string resetToken, CancellationToken cancellationToken = default)
        => await SendEmailAsync(to, "Password Reset Request",
            $"<h1>Password Reset</h1><p>Use this token to reset your password: <strong>{resetToken}</strong></p><p>This token expires in 1 hour.</p>",
            cancellationToken: cancellationToken);

    public async Task SendWelcomeEmailAsync(string to, string firstName, CancellationToken cancellationToken = default)
        => await SendEmailAsync(to, "Welcome to SmartCommerce!",
            $"<h1>Welcome, {firstName}!</h1><p>Thank you for joining SmartCommerce. Start shopping today!</p>",
            cancellationToken: cancellationToken);
}
