using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;

namespace SmartCommerce.Application.Features.Inventory.Queries;

public record InventoryDto(
    Guid ProductId,
    string ProductName,
    string Sku,
    int QuantityInStock,
    int QuantityReserved,
    int AvailableQuantity,
    int LowStockThreshold,
    bool IsLowStock,
    bool IsOutOfStock,
    string? WarehouseLocation);

public record GetInventoryQuery(Guid ProductId) : IRequest<InventoryDto>;
public record GetLowStockItemsQuery : IRequest<List<InventoryDto>>;

public class GetInventoryQueryHandler : IRequestHandler<GetInventoryQuery, InventoryDto>
{
    private readonly IApplicationDbContext _context;
    public GetInventoryQueryHandler(IApplicationDbContext context) { _context = context; }

    public async Task<InventoryDto> Handle(GetInventoryQuery request, CancellationToken cancellationToken)
    {
        var inv = await _context.Inventories
            .Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.ProductId == request.ProductId, cancellationToken)
            ?? throw new NotFoundException("Inventory", request.ProductId);

        return Map(inv);
    }

    internal static InventoryDto Map(Domain.Entities.Inventory i) =>
        new(i.ProductId, i.Product.Name, i.Product.Sku,
            i.QuantityInStock, i.QuantityReserved, i.AvailableQuantity,
            i.LowStockThreshold, i.IsLowStock, i.IsOutOfStock, i.WarehouseLocation);
}

public class GetLowStockItemsQueryHandler : IRequestHandler<GetLowStockItemsQuery, List<InventoryDto>>
{
    private readonly IApplicationDbContext _context;
    public GetLowStockItemsQueryHandler(IApplicationDbContext context) { _context = context; }

    public async Task<List<InventoryDto>> Handle(GetLowStockItemsQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.Inventories
            .Include(i => i.Product)
            .Where(i => i.QuantityInStock <= i.LowStockThreshold && !i.Product.IsDeleted)
            .OrderBy(i => i.QuantityInStock)
            .ToListAsync(cancellationToken);

        return items.Select(GetInventoryQueryHandler.Map).ToList();
    }
}
