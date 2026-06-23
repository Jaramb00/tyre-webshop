using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Application.Features.Cart.DTOs;

namespace SmartCommerce.Application.Features.Cart.Queries;

public record GetCartQuery(Guid UserId) : IRequest<CartDto>;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, CartDto>
{
    private readonly IApplicationDbContext _context;
    public GetCartQueryHandler(IApplicationDbContext context) { _context = context; }

    public async Task<CartDto> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(ci => ci.Product)
            .ThenInclude(p => p.Inventory)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId && !c.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Cart not found for user.");

        return new CartDto(
            cart.Id,
            cart.Items.Select(i => new CartItemDto(
                i.Id,
                i.ProductId,
                i.Product.Name,
                i.Product.Slug,
                i.Product.ImageUrl,
                i.UnitPrice,
                i.Quantity,
                i.TotalPrice,
                i.Product.IsActive && (i.Product.Inventory?.AvailableQuantity ?? 0) > 0,
                i.Product.Inventory?.AvailableQuantity)).ToList(),
            cart.SubTotal,
            cart.TotalItems);
    }
}
