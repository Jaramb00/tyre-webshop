using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Application.Common.Models;

namespace SmartCommerce.Application.Features.Reviews.Queries;

public record ReviewDto(Guid Id, Guid UserId, string UserName, int Rating, string Title, string Body, bool IsVerifiedPurchase, DateTime CreatedAt);
public record GetProductReviewsQuery(Guid ProductId, int PageNumber, int PageSize) : IRequest<PaginatedList<ReviewDto>>;

public class GetProductReviewsQueryHandler : IRequestHandler<GetProductReviewsQuery, PaginatedList<ReviewDto>>
{
    private readonly IApplicationDbContext _context;
    public GetProductReviewsQueryHandler(IApplicationDbContext context) { _context = context; }

    public async Task<PaginatedList<ReviewDto>> Handle(GetProductReviewsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == request.ProductId && r.IsApproved && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto(
                r.Id, r.UserId, r.User.FullName, r.Rating,
                r.Title, r.Body, r.IsVerifiedPurchase, r.CreatedAt));

        return await PaginatedList<ReviewDto>.CreateAsync(query, request.PageNumber, request.PageSize, cancellationToken);
    }
}
