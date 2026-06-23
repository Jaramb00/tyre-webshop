using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;

namespace SmartCommerce.Application.Features.Cart.Commands;

public record AddToCartCommand(Guid UserId, Guid ProductId, int Quantity) : IRequest<Guid>;

public class AddToCartCommandValidator : AbstractValidator<AddToCartCommand>
{
    public AddToCartCommandValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0).LessThanOrEqualTo(100);
    }
}

public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    public AddToCartCommandHandler(IApplicationDbContext context) { _context = context; }

    public async Task<Guid> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .Include(p => p.Inventory)
            .FirstOrDefaultAsync(p => p.Id == request.ProductId && p.IsActive && !p.IsDeleted, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Product), request.ProductId);

        if (product.Inventory?.IsOutOfStock == true)
            throw new BusinessRuleException($"Product '{product.Name}' is out of stock.");

        if (product.Inventory != null && product.Inventory.AvailableQuantity < request.Quantity)
            throw new BusinessRuleException($"Only {product.Inventory.AvailableQuantity} units available.");

        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId && !c.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Cart not found.");

        var existingIds = cart.Items.Select(i => i.Id).ToHashSet();
        var item = cart.AddItem(product, request.Quantity);

        // If this is a new item (not previously in cart), explicitly add it so EF tracks it as Added.
        // Without this, EF may infer Modified state for entities with pre-set Guid keys.
        if (!existingIds.Contains(item.Id))
            await _context.CartItems.AddAsync(item, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
        return item.Id;
    }
}
