using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;

namespace SmartCommerce.Application.Features.Cart.Commands;

public record UpdateCartItemCommand(Guid UserId, Guid ProductId, int Quantity) : IRequest;
public record RemoveCartItemCommand(Guid UserId, Guid ProductId) : IRequest;
public record ClearCartCommand(Guid UserId) : IRequest;

public class UpdateCartItemCommandHandler : IRequestHandler<UpdateCartItemCommand>
{
    private readonly IApplicationDbContext _context;
    public UpdateCartItemCommandHandler(IApplicationDbContext context) { _context = context; }

    public async Task Handle(UpdateCartItemCommand request, CancellationToken cancellationToken)
    {
        var cart = await _context.Carts.Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId && !c.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Cart not found.");

        cart.UpdateItemQuantity(request.ProductId, request.Quantity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}

public class RemoveCartItemCommandHandler : IRequestHandler<RemoveCartItemCommand>
{
    private readonly IApplicationDbContext _context;
    public RemoveCartItemCommandHandler(IApplicationDbContext context) { _context = context; }

    public async Task Handle(RemoveCartItemCommand request, CancellationToken cancellationToken)
    {
        var cart = await _context.Carts.Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId && !c.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Cart not found.");

        cart.RemoveItem(request.ProductId);
        await _context.SaveChangesAsync(cancellationToken);
    }
}

public class ClearCartCommandHandler : IRequestHandler<ClearCartCommand>
{
    private readonly IApplicationDbContext _context;
    public ClearCartCommandHandler(IApplicationDbContext context) { _context = context; }

    public async Task Handle(ClearCartCommand request, CancellationToken cancellationToken)
    {
        var cart = await _context.Carts.Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId && !c.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Cart not found.");

        cart.Clear();
        await _context.SaveChangesAsync(cancellationToken);
    }
}
