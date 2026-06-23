using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartCommerce.Application.Features.Inventory.Commands;
using SmartCommerce.Application.Features.Inventory.Queries;

namespace SmartCommerce.API.Controllers.V1;

/// <summary>Inventory management endpoints</summary>
[Authorize(Roles = "Admin,Manager,WarehouseWorker")]
public class InventoryController : BaseController
{
    /// <summary>Get inventory status for a product</summary>
    [HttpGet("{productId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInventory(Guid productId, CancellationToken cancellationToken)
    {
        var result = await Sender.Send(new GetInventoryQuery(productId), cancellationToken);
        return Ok(result);
    }

    /// <summary>Get all low stock items</summary>
    [HttpGet("low-stock")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLowStockItems(CancellationToken cancellationToken)
    {
        var result = await Sender.Send(new GetLowStockItemsQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Add stock to a product</summary>
    [HttpPost("{productId:guid}/add")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> AddStock(Guid productId, [FromBody] AddStockRequest request, CancellationToken cancellationToken)
    {
        await Sender.Send(new AddStockCommand(productId, request.Quantity, request.Reason), cancellationToken);
        return Ok();
    }

    /// <summary>Update inventory thresholds</summary>
    [HttpPatch("{productId:guid}/thresholds")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateThresholds(Guid productId, [FromBody] UpdateThresholdsRequest request, CancellationToken cancellationToken)
    {
        await Sender.Send(new UpdateInventoryThresholdsCommand(productId, request.LowStockThreshold, request.ReorderPoint, request.ReorderQuantity), cancellationToken);
        return NoContent();
    }
}

public record AddStockRequest(int Quantity, string? Reason);
public record UpdateThresholdsRequest(int LowStockThreshold, int? ReorderPoint, int? ReorderQuantity);
