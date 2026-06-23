using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;

namespace SmartCommerce.Application.Features.Products.Commands;

public record PublishProductCommand(Guid Id) : IRequest;

public class PublishProductCommandHandler : IRequestHandler<PublishProductCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cache;
    public PublishProductCommandHandler(IApplicationDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task Handle(PublishProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == request.Id && !p.IsDeleted, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Product), request.Id);

        product.Publish();
        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveAsync($"product:{request.Id}", cancellationToken);
    }
}
