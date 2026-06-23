using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Application.Common.Models;
using SmartCommerce.Application.Features.Orders.Commands;
using SmartCommerce.Application.Features.Orders.DTOs;
using SmartCommerce.Application.Features.Orders.Queries;

namespace SmartCommerce.API.Controllers.V1;

/// <summary>Order management endpoints</summary>
[Authorize]
public class OrdersController : BaseController
{
    private readonly ICurrentUserService _currentUser;
    public OrdersController(ICurrentUserService currentUser) { _currentUser = currentUser; }

    /// <summary>Create a new order from the current cart</summary>
    [HttpPost]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();
        var orderId = await Sender.Send(new CreateOrderCommand(userId, dto), cancellationToken);
        return CreatedAtAction(nameof(GetOrder), new { id = orderId }, orderId);
    }

    /// <summary>Get order by ID</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrder(Guid id, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId;
        var result = await Sender.Send(new GetOrderByIdQuery(id, userId), cancellationToken);
        return Ok(result);
    }

    /// <summary>Get current user's order history</summary>
    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(typeof(PaginatedList<OrderSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyOrders([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();
        var result = await Sender.Send(new GetUserOrdersQuery(userId, pageNumber, pageSize), cancellationToken);
        return Ok(result);
    }

    /// <summary>Cancel an order</summary>
    [HttpPost("{id:guid}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CancelOrder(Guid id, [FromBody] CancelOrderRequest request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();
        await Sender.Send(new CancelOrderCommand(id, userId, request.Reason), cancellationToken);
        return NoContent();
    }

    /// <summary>Get all orders (Admin/Manager only)</summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(PaginatedList<OrderSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllOrders([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, [FromQuery] string? status = null, CancellationToken cancellationToken = default)
    {
        var result = await Sender.Send(new GetAllOrdersQuery(pageNumber, pageSize, status), cancellationToken);
        return Ok(result);
    }

    /// <summary>Update order status (Admin/Manager/WarehouseWorker)</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin,Manager,WarehouseWorker")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request, CancellationToken cancellationToken)
    {
        await Sender.Send(new UpdateOrderStatusCommand(id, request.Status, request.TrackingNumber), cancellationToken);
        return NoContent();
    }
}

public record CancelOrderRequest(string Reason);
public record UpdateOrderStatusRequest(string Status, string? TrackingNumber);
