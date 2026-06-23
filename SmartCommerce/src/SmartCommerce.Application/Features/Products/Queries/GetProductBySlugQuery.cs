using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Application.Features.Products.DTOs;

namespace SmartCommerce.Application.Features.Products.Queries;

public record GetProductBySlugQuery(string Slug) : IRequest<ProductDto>;

public class GetProductBySlugQueryHandler : IRequestHandler<GetProductBySlugQuery, ProductDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cache;
    public GetProductBySlugQueryHandler(IApplicationDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<ProductDto> Handle(GetProductBySlugQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = $"product:slug:{request.Slug}";
        return await _cache.GetOrSetAsync(cacheKey, async () =>
        {
            var product = await _context.Products
                .Include(x => x.Category)
                .Include(x => x.Brand)
                .Include(x => x.Inventory)
                .Include(x => x.Reviews)
                .FirstOrDefaultAsync(x => x.Slug == request.Slug && !x.IsDeleted, cancellationToken)
                ?? throw new NotFoundException($"Product with slug '{request.Slug}' was not found.");

            return new ProductDto(
                product.Id, product.Name, product.Slug, product.Description,
                product.ShortDescription, product.Price, product.CompareAtPrice,
                product.Sku, product.ImageUrl, product.ImageUrls,
                product.IsActive, product.IsFeatured, product.Status.ToString(),
                product.Inventory?.QuantityInStock,
                product.Inventory?.IsLowStock ?? false,
                product.Inventory?.IsOutOfStock ?? false,
                product.GetAverageRating(),
                product.Reviews.Count(r => r.IsApproved),
                product.Category.Name, product.CategoryId,
                product.Brand.Name, product.BrandId,
                product.CreatedAt);
        }, TimeSpan.FromMinutes(15), cancellationToken);
    }
}
