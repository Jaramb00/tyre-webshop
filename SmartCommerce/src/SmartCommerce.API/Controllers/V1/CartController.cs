using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Application.Features.Cart.Commands;
using SmartCommerce.Application.Features.Cart.DTOs;
using SmartCommerce.Application.Features.Cart.Queries;

namespace SmartCommerce.API.Controllers.V1;

/// <summary>Shopping cart endpoints</summary>
[Authorize(Roles = "Customer")]
public class CartController : BaseController
{
    private readonly ICurrentUserService _currentUser;
    public CartController(ICurrentUserService currentUser) { _currentUser = currentUser; }

    /// <summary>Get the current user's cart</summary>
    [HttpGet]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCart(CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();
        var result = await Sender.Send(new GetCartQuery(userId), cancellationToken);
        return Ok(result);
    }

    /// <summary>Add item to cart</summary>
    [HttpPost("items")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    public async Task<IActionResult> AddItem([FromBody] AddToCartCommand command, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();
        var itemId = await Sender.Send(command with { UserId = userId }, cancellationToken);
        return Ok(itemId);
    }

    /// <summary>Update cart item quantity</summary>
    [HttpPatch("items/{productId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateQuantity(Guid productId, [FromBody] UpdateCartItemRequest request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();
        await Sender.Send(new UpdateCartItemCommand(userId, productId, request.Quantity), cancellationToken);
        return NoContent();
    }

    /// <summary>Remove item from cart</summary>
    [HttpDelete("items/{productId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RemoveItem(Guid productId, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();
        await Sender.Send(new RemoveCartItemCommand(userId, productId), cancellationToken);
        return NoContent();
    }

    /// <summary>Clear the entire cart</summary>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ClearCart(CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();
        await Sender.Send(new ClearCartCommand(userId), cancellationToken);
        return NoContent();
    }
}

public record UpdateCartItemRequest(int Quantity);
