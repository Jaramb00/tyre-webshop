using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;

namespace SmartCommerce.Application.Features.Inventory.Commands;

public record AddStockCommand(Guid ProductId, int Quantity, string? Reason) : IRequest;
public record UpdateInventoryThresholdsCommand(Guid ProductId, int LowStockThreshold, int? ReorderPoint, int? ReorderQuantity) : IRequest;

public class AddStockCommandHandler : IRequestHandler<AddStockCommand>
{
    private readonly IApplicationDbContext _context;
    public AddStockCommandHandler(IApplicationDbContext context) { _context = context; }

    public async Task Handle(AddStockCommand request, CancellationToken cancellationToken)
    {
        var inventory = await _context.Inventories
            .FirstOrDefaultAsync(i => i.ProductId == request.ProductId, cancellationToken)
            ?? throw new NotFoundException("Inventory", request.ProductId);

        inventory.AddStock(request.Quantity, request.Reason);
        await _context.SaveChangesAsync(cancellationToken);
    }
}

public class UpdateInventoryThresholdsCommandHandler : IRequestHandler<UpdateInventoryThresholdsCommand>
{
    private readonly IApplicationDbContext _context;
    public UpdateInventoryThresholdsCommandHandler(IApplicationDbContext context) { _context = context; }

    public async Task Handle(UpdateInventoryThresholdsCommand request, CancellationToken cancellationToken)
    {
        var inventory = await _context.Inventories
            .FirstOrDefaultAsync(i => i.ProductId == request.ProductId, cancellationToken)
            ?? throw new NotFoundException("Inventory", request.ProductId);

        inventory.UpdateThresholds(request.LowStockThreshold, request.ReorderPoint, request.ReorderQuantity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
