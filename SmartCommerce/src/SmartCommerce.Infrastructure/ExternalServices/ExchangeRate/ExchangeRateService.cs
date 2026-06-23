using Microsoft.Extensions.Options;
using SmartCommerce.Application.Common.Interfaces;
using System.Text.Json;

namespace SmartCommerce.Infrastructure.ExternalServices.ExchangeRate;

public class ExchangeRateSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://v6.exchangerate-api.com/v6";
}

public class ExchangeRateService : ICurrencyService
{
    private readonly HttpClient _httpClient;
    private readonly ExchangeRateSettings _settings;
    public ExchangeRateService(HttpClient httpClient, IOptions<ExchangeRateSettings> options)
    {
        _httpClient = httpClient;
        _settings = options.Value;
    }

    public async Task<decimal> ConvertAsync(decimal amount, string from, string to, CancellationToken cancellationToken = default)
    {
        var rates = await GetRatesAsync(from, cancellationToken);
        if (!rates.TryGetValue(to, out var rate)) return amount;
        return Math.Round(amount * rate, 2);
    }

    public async Task<IDictionary<string, decimal>> GetRatesAsync(string baseCurrency, CancellationToken cancellationToken = default)
    {
        var url = $"{_settings.BaseUrl}/{_settings.ApiKey}/latest/{baseCurrency.ToUpper()}";
        var response = await _httpClient.GetAsync(url, cancellationToken);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        using var doc = JsonDocument.Parse(json);
        var conversionRates = doc.RootElement.GetProperty("conversion_rates");

        return conversionRates.EnumerateObject()
            .ToDictionary(p => p.Name, p => (decimal)p.Value.GetDouble());
    }
}
