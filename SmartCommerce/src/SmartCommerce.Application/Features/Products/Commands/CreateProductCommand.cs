using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Domain.Entities;

namespace SmartCommerce.Application.Features.Products.Commands;

public record CreateProductCommand(
    string Name,
    string Description,
    string? ShortDescription,
    decimal Price,
    decimal? CompareAtPrice,
    decimal CostPrice,
    string Sku,
    string? Barcode,
    decimal Weight,
    string? ImageUrl,
    List<string>? ImageUrls,
    Guid CategoryId,
    Guid BrandId,
    int InitialStock = 0,
    int LowStockThreshold = 10) : IRequest<Guid>;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(5000);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.CostPrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Sku).NotEmpty().MaximumLength(50);
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.BrandId).NotEmpty();
        RuleFor(x => x.InitialStock).GreaterThanOrEqualTo(0);
    }
}

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cache;
    public CreateProductCommandHandler(IApplicationDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<Guid> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var skuExists = await _context.Products
            .AnyAsync(p => p.Sku == request.Sku && !p.IsDeleted, cancellationToken);
        if (skuExists) throw new ConflictException($"SKU '{request.Sku}' already exists.");

        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId, cancellationToken);
        if (!categoryExists) throw new NotFoundException(nameof(Category), request.CategoryId);

        var brandExists = await _context.Brands.AnyAsync(b => b.Id == request.BrandId, cancellationToken);
        if (!brandExists) throw new NotFoundException(nameof(Brand), request.BrandId);

        var product = Product.Create(
            request.Name,
            request.Description,
            request.Price,
            request.CostPrice,
            request.Sku,
            request.CategoryId,
            request.BrandId,
            request.Weight);

        product.UpdateDetails(
            request.Name,
            request.Description,
            request.ShortDescription,
            request.Price,
            request.CompareAtPrice,
            request.CostPrice,
            request.ImageUrl,
            request.ImageUrls);

        var inventory = Domain.Entities.Inventory.Create(product.Id, request.InitialStock, request.LowStockThreshold);

        await _context.Products.AddAsync(product, cancellationToken);
        await _context.Inventories.AddAsync(inventory, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        await _cache.RemoveByPatternAsync("products:*", cancellationToken);

        return product.Id;
    }
}
