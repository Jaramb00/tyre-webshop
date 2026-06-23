using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SmartCommerce.Application.Common.Models;
using SmartCommerce.Application.Features.Products.Commands;
using SmartCommerce.Application.Features.Products.DTOs;
using SmartCommerce.Application.Features.Products.Queries;
using SmartCommerce.Application.Features.Reviews.Commands;
using SmartCommerce.Application.Features.Reviews.Queries;

namespace SmartCommerce.API.Controllers.V1;

/// <summary>Product management endpoints</summary>
public class ProductsController : BaseController
{
    /// <summary>Get paginated list of products with filtering, sorting, and search</summary>
    [HttpGet]
    [EnableRateLimiting("fixed")]
    [ProducesResponseType(typeof(PaginatedList<ProductListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProducts([FromQuery] ProductSearchParams searchParams, CancellationToken cancellationToken)
    {
        var result = await Sender.Send(new GetProductsQuery(searchParams), cancellationToken);
        return Ok(result);
    }

    /// <summary>Get product by ID</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProduct(Guid id, CancellationToken cancellationToken)
    {
        var result = await Sender.Send(new GetProductByIdQuery(id), cancellationToken);
        return Ok(result);
    }

    /// <summary>Get product by slug</summary>
    [HttpGet("slug/{slug}")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProductBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await Sender.Send(new GetProductBySlugQuery(slug), cancellationToken);
        return Ok(result);
    }

    /// <summary>Create a new product (Admin/Manager only)</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command, CancellationToken cancellationToken)
    {
        var id = await Sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetProduct), new { id }, id);
    }

    /// <summary>Update product (Admin/Manager only)</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductDto dto, CancellationToken cancellationToken)
    {
        await Sender.Send(new UpdateProductCommand(id, dto), cancellationToken);
        return NoContent();
    }

    /// <summary>Delete product (Admin only)</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken cancellationToken)
    {
        await Sender.Send(new DeleteProductCommand(id), cancellationToken);
        return NoContent();
    }

    /// <summary>Publish a product (Admin/Manager)</summary>
    [HttpPost("{id:guid}/publish")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> PublishProduct(Guid id, CancellationToken cancellationToken)
    {
        await Sender.Send(new PublishProductCommand(id), cancellationToken);
        return NoContent();
    }

    /// <summary>Get product reviews</summary>
    [HttpGet("{id:guid}/reviews")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReviews(Guid id, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var result = await Sender.Send(new GetProductReviewsQuery(id, pageNumber, pageSize), cancellationToken);
        return Ok(result);
    }

    /// <summary>Add a review for a product</summary>
    [HttpPost("{id:guid}/reviews")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> AddReview(Guid id, [FromBody] CreateReviewDto dto, CancellationToken cancellationToken)
    {
        var reviewId = await Sender.Send(new CreateReviewCommand(id, dto), cancellationToken);
        return Created($"/api/v1/products/{id}/reviews/{reviewId}", reviewId);
    }
}
