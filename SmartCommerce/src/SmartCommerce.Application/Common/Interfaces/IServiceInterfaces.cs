namespace SmartCommerce.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    IEnumerable<string> Roles { get; }
    bool IsAuthenticated { get; }
    string? IpAddress { get; }
}

public interface IJwtService
{
    string GenerateAccessToken(Domain.Entities.User user, IEnumerable<string> roles);
    string GenerateRefreshToken();
    Guid? ValidateAccessToken(string token);
}

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default);
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);
    Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default);
    Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null, CancellationToken cancellationToken = default);
}

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, bool isHtml = true, CancellationToken cancellationToken = default);
    Task SendOrderConfirmationAsync(string to, string orderNumber, decimal total, CancellationToken cancellationToken = default);
    Task SendOrderShippedAsync(string to, string orderNumber, string trackingNumber, CancellationToken cancellationToken = default);
    Task SendPasswordResetAsync(string to, string resetToken, CancellationToken cancellationToken = default);
    Task SendWelcomeEmailAsync(string to, string firstName, CancellationToken cancellationToken = default);
}

public interface INotificationService
{
    Task SendAsync(Guid userId, string title, string message, Domain.Enums.NotificationType type, string? actionUrl = null, CancellationToken cancellationToken = default);
    Task SendToRoleAsync(string role, string title, string message, Domain.Enums.NotificationType type, CancellationToken cancellationToken = default);
}

public interface IPaymentService
{
    Task<string> CreatePaymentIntentAsync(decimal amount, string currency, string orderId, CancellationToken cancellationToken = default);
    Task<string> CreateCheckoutSessionAsync(Guid orderId, string successUrl, string cancelUrl, CancellationToken cancellationToken = default);
    Task<bool> ConfirmPaymentAsync(string paymentIntentId, CancellationToken cancellationToken = default);
    Task<string> CreateRefundAsync(string chargeId, decimal amount, CancellationToken cancellationToken = default);
}

public interface IWeatherService
{
    Task<WeatherResult?> GetWeatherAsync(string city, string country, CancellationToken cancellationToken = default);
    Task<string> GetDeliveryWeatherEstimateAsync(string city, string country, CancellationToken cancellationToken = default);
}

public interface ICurrencyService
{
    Task<decimal> ConvertAsync(decimal amount, string from, string to, CancellationToken cancellationToken = default);
    Task<IDictionary<string, decimal>> GetRatesAsync(string baseCurrency, CancellationToken cancellationToken = default);
}

public record WeatherResult(string Condition, double Temperature, double Humidity, string Description);
