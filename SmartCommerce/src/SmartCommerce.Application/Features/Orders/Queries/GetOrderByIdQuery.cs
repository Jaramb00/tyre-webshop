using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Application.Features.Orders.DTOs;

namespace SmartCommerce.Application.Features.Orders.Queries;

public record GetOrderByIdQuery(Guid OrderId, Guid? RequestingUserId) : IRequest<OrderDto>;
public record GetUserOrdersQuery(Guid UserId, int PageNumber, int PageSize) : IRequest<Common.Models.PaginatedList<OrderSummaryDto>>;
public record GetAllOrdersQuery(int PageNumber, int PageSize, string? Status) : IRequest<Common.Models.PaginatedList<OrderSummaryDto>>;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    public GetOrderByIdQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<OrderDto> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.Payment)
            .Include(o => o.Shipment)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && !o.IsDeleted, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Order), request.OrderId);

        var isAdmin = _currentUser.Roles.Any(r => r is "Admin" or "Manager");
        if (!isAdmin && order.UserId != request.RequestingUserId)
            throw new ForbiddenException();

        return MapToDto(order);
    }

    private static OrderDto MapToDto(Domain.Entities.Order o) => new(
        o.Id, o.OrderNumber, o.Status.ToString(),
        o.Subtotal, o.TaxAmount, o.ShippingCost, o.DiscountAmount, o.Total, o.Currency,
        o.Notes, o.CreatedAt, o.ShippedAt, o.DeliveredAt, o.CancelledAt, o.CancellationReason,
        MapAddress(o.ShippingAddress), MapAddress(o.BillingAddress),
        o.Items.Select(i => new OrderItemDto(i.Id, i.ProductId, i.ProductName, i.ProductSku, i.ProductImageUrl, i.Quantity, i.UnitPrice, i.TotalPrice)).ToList(),
        o.Payment == null ? null : new PaymentSummaryDto(o.Payment.Id, o.Payment.Status.ToString(), o.Payment.Method.ToString(), o.Payment.Amount, o.Payment.Currency, o.Payment.PaidAt),
        o.Shipment == null ? null : new ShipmentSummaryDto(o.Shipment.Id, o.Shipment.TrackingNumber, o.Shipment.Carrier, o.Shipment.Status.ToString(), o.Shipment.EstimatedDelivery, o.Shipment.ShippedAt, o.Shipment.DeliveredAt));

    private static AddressDto MapAddress(Domain.Entities.Address a) =>
        new(a.FullName, a.Line1, a.Line2, a.City, a.State, a.PostalCode, a.Country, a.PhoneNumber);
}

public class GetUserOrdersQueryHandler : IRequestHandler<GetUserOrdersQuery, Common.Models.PaginatedList<OrderSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    public GetUserOrdersQueryHandler(IApplicationDbContext context) { _context = context; }

    public async Task<Common.Models.PaginatedList<OrderSummaryDto>> Handle(GetUserOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders
            .Where(o => o.UserId == request.UserId && !o.IsDeleted)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderSummaryDto(o.Id, o.OrderNumber, o.Status.ToString(), o.Total, o.Items.Count, o.CreatedAt, o.DeliveredAt));

        return await Common.Models.PaginatedList<OrderSummaryDto>.CreateAsync(query, request.PageNumber, request.PageSize, cancellationToken);
    }
}

public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, Common.Models.PaginatedList<OrderSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    public GetAllOrdersQueryHandler(IApplicationDbContext context) { _context = context; }

    public async Task<Common.Models.PaginatedList<OrderSummaryDto>> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders
            .Where(o => !o.IsDeleted)
            .OrderByDescending(o => o.CreatedAt)
            .AsQueryable();

        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<Domain.Enums.OrderStatus>(request.Status, out var status))
            query = query.Where(o => o.Status == status);

        var projected = query.Select(o => new OrderSummaryDto(o.Id, o.OrderNumber, o.Status.ToString(), o.Total, o.Items.Count, o.CreatedAt, o.DeliveredAt));
        return await Common.Models.PaginatedList<OrderSummaryDto>.CreateAsync(projected, request.PageNumber, request.PageSize, cancellationToken);
    }
}
