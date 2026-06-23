using Microsoft.Extensions.Options;
using SmartCommerce.Application.Common.Interfaces;
using System.Text.Json;

namespace SmartCommerce.Infrastructure.ExternalServices.OpenWeather;

public class OpenWeatherSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.openweathermap.org/data/2.5";
}

public class OpenWeatherService : IWeatherService
{
    private readonly HttpClient _httpClient;
    private readonly OpenWeatherSettings _settings;
    public OpenWeatherService(HttpClient httpClient, IOptions<OpenWeatherSettings> options)
    {
        _httpClient = httpClient;
        _settings = options.Value;
    }

    public async Task<WeatherResult?> GetWeatherAsync(string city, string country, CancellationToken cancellationToken = default)
    {
        var url = $"{_settings.BaseUrl}/weather?q={city},{country}&appid={_settings.ApiKey}&units=metric";
        var response = await _httpClient.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode) return null;

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        using var doc = JsonDocument.Parse(json);

        var weather = doc.RootElement.GetProperty("weather")[0];
        var main = doc.RootElement.GetProperty("main");

        return new WeatherResult(
            weather.GetProperty("main").GetString() ?? "Unknown",
            main.GetProperty("temp").GetDouble(),
            main.GetProperty("humidity").GetDouble(),
            weather.GetProperty("description").GetString() ?? "Unknown");
    }

    public async Task<string> GetDeliveryWeatherEstimateAsync(string city, string country, CancellationToken cancellationToken = default)
    {
        var weather = await GetWeatherAsync(city, country, cancellationToken);
        if (weather is null) return "Weather data unavailable.";

        return weather.Condition switch
        {
            "Thunderstorm" or "Snow" => "Severe weather expected. Delivery may be delayed by 1-2 days.",
            "Rain" or "Drizzle" => "Rain expected. Delivery may be slightly delayed.",
            "Clear" or "Clouds" => "Good weather conditions. Delivery on schedule.",
            _ => "Weather conditions may affect delivery."
        };
    }
}
