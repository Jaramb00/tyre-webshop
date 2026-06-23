using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Interfaces;

namespace SmartCommerce.Application.Features.Auth.Commands;

public record LogoutCommand : IRequest;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    public LogoutCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null) return;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, cancellationToken);
        user?.RevokeRefreshToken();
        await _context.SaveChangesAsync(cancellationToken);
    }
}
