namespace SmartCommerce.Domain.Entities;

public record Address
{
    public string FullName { get; init; } = string.Empty;
    public string Line1 { get; init; } = string.Empty;
    public string? Line2 { get; init; }
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public string? PhoneNumber { get; init; }

    public string FormattedAddress =>
        string.Join(", ", new[] { Line1, Line2, City, State, PostalCode, Country }
            .Where(s => !string.IsNullOrEmpty(s)));
}
