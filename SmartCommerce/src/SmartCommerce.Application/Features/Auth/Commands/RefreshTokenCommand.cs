using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Application.Features.Auth.DTOs;

namespace SmartCommerce.Application.Features.Auth.Commands;

public record RefreshTokenCommand(string AccessToken, string RefreshToken) : IRequest<AuthResponse>;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtService _jwtService;
    public RefreshTokenCommandHandler(IApplicationDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<AuthResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var userId = _jwtService.ValidateAccessToken(request.AccessToken)
            ?? throw new UnauthorizedException("Invalid access token.");

        var user = await _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new UnauthorizedException("User not found.");

        if (user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiry < DateTime.UtcNow)
            throw new UnauthorizedException("Invalid or expired refresh token.");

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var newAccessToken = _jwtService.GenerateAccessToken(user, roles);
        var newRefreshToken = _jwtService.GenerateRefreshToken();

        user.SetRefreshToken(newRefreshToken, DateTime.UtcNow.AddDays(30));
        await _context.SaveChangesAsync(cancellationToken);

        return new AuthResponse(newAccessToken, newRefreshToken, user.Id, user.Email, user.FullName, user.AvatarUrl, roles);
    }
}
