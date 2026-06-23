namespace SmartCommerce.Application.Features.Auth.DTOs;

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    Guid UserId,
    string Email,
    string FullName,
    string? AvatarUrl,
    IEnumerable<string> Roles);

public record UserProfileDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string? AvatarUrl,
    bool EmailConfirmed,
    DateTime? LastLoginAt,
    IEnumerable<string> Roles);
