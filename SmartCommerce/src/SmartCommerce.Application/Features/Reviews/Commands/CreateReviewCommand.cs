using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Domain.Entities;

namespace SmartCommerce.Application.Features.Reviews.Commands;

public record CreateReviewDto(int Rating, string Title, string Body);
public record CreateReviewCommand(Guid ProductId, CreateReviewDto Dto) : IRequest<Guid>;

public class CreateReviewCommandValidator : AbstractValidator<CreateReviewCommand>
{
    public CreateReviewCommandValidator()
    {
        RuleFor(x => x.Dto.Rating).InclusiveBetween(1, 5);
        RuleFor(x => x.Dto.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Dto.Body).NotEmpty().MaximumLength(2000);
    }
}

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    public CreateReviewCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        var productExists = await _context.Products.AnyAsync(p => p.Id == request.ProductId && !p.IsDeleted, cancellationToken);
        if (!productExists) throw new NotFoundException(nameof(Product), request.ProductId);

        var hasVerifiedPurchase = await _context.Orders
            .AnyAsync(o => o.UserId == userId
                && o.Items.Any(i => i.ProductId == request.ProductId)
                && o.Status == Domain.Enums.OrderStatus.Delivered, cancellationToken);

        var review = Review.Create(request.ProductId, userId, request.Dto.Rating, request.Dto.Title, request.Dto.Body, hasVerifiedPurchase);
        await _context.Reviews.AddAsync(review, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return review.Id;
    }
}
