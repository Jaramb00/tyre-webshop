using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Application.Features.Products.DTOs;

namespace SmartCommerce.Application.Features.Products.Commands;

public record UpdateProductCommand(Guid Id, UpdateProductDto Dto) : IRequest;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cache;
    public UpdateProductCommandHandler(IApplicationDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == request.Id && !p.IsDeleted, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Product), request.Id);

        product.UpdateDetails(
            request.Dto.Name,
            request.Dto.Description,
            request.Dto.ShortDescription,
            request.Dto.Price,
            request.Dto.CompareAtPrice,
            request.Dto.CostPrice,
            request.Dto.ImageUrl,
            request.Dto.ImageUrls);

        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveAsync($"product:{request.Id}", cancellationToken);
        await _cache.RemoveByPatternAsync("products:*", cancellationToken);
    }
}
