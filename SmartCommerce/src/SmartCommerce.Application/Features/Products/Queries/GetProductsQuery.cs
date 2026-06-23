using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Application.Common.Models;
using SmartCommerce.Application.Features.Products.DTOs;

namespace SmartCommerce.Application.Features.Products.Queries;

public record GetProductsQuery(ProductSearchParams Params) : IRequest<PaginatedList<ProductListDto>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PaginatedList<ProductListDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cache;
    public GetProductsQueryHandler(IApplicationDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<PaginatedList<ProductListDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var p = request.Params;
        var query = _context.Products
            .Include(x => x.Category)
            .Include(x => x.Brand)
            .Include(x => x.Inventory)
            .Include(x => x.Reviews)
            .Where(x => !x.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrEmpty(p.Search))
            query = query.Where(x => x.Name.ToLower().Contains(p.Search.ToLower())
                || x.Description.ToLower().Contains(p.Search.ToLower())
                || x.Sku.ToLower().Contains(p.Search.ToLower()));

        if (p.CategoryId.HasValue) query = query.Where(x => x.CategoryId == p.CategoryId);
        if (p.BrandId.HasValue) query = query.Where(x => x.BrandId == p.BrandId);
        if (p.MinPrice.HasValue) query = query.Where(x => x.Price >= p.MinPrice);
        if (p.MaxPrice.HasValue) query = query.Where(x => x.Price <= p.MaxPrice);
        if (p.IsActive.HasValue) query = query.Where(x => x.IsActive == p.IsActive);
        if (p.IsFeatured.HasValue) query = query.Where(x => x.IsFeatured == p.IsFeatured);
        if (p.InStock == true) query = query.Where(x => x.Inventory != null && x.Inventory.QuantityInStock > 0);

        query = p.SortBy?.ToLower() switch
        {
            "price" => p.SortDescending ? query.OrderByDescending(x => x.Price) : query.OrderBy(x => x.Price),
            "name" => p.SortDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
            "newest" => query.OrderByDescending(x => x.CreatedAt),
            _ => query.OrderByDescending(x => x.CreatedAt)
        };

        var projected = query.Select(x => new ProductListDto(
            x.Id,
            x.Name,
            x.Slug,
            x.Price,
            x.CompareAtPrice,
            x.ImageUrl,
            x.IsActive,
            x.IsFeatured,
            x.Reviews.Any() ? x.Reviews.Average(r => r.Rating) : 0,
            x.Reviews.Count,
            x.Inventory != null ? x.Inventory.QuantityInStock : null,
            x.Inventory != null && x.Inventory.QuantityInStock <= x.LowStockThreshold,
            x.Category.Name,
            x.Brand.Name));

        return await PaginatedList<ProductListDto>.CreateAsync(projected, p.PageNumber, p.PageSize, cancellationToken);
    }
}
