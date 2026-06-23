namespace SmartCommerce.Application.Features.Cart.DTOs;

public record CartDto(
    Guid Id,
    List<CartItemDto> Items,
    decimal SubTotal,
    int TotalItems);

public record CartItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string ProductSlug,
    string? ProductImageUrl,
    decimal UnitPrice,
    int Quantity,
    decimal TotalPrice,
    bool IsAvailable,
    int? MaxQuantity);
