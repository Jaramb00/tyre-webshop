using FluentAssertions;
using MockQueryable.Moq;
using Moq;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Application.Features.Products.Commands;
using SmartCommerce.Domain.Entities;
using Xunit;

namespace SmartCommerce.UnitTests.Features.Products;

public class CreateProductCommandTests
{
    private static Mock<IApplicationDbContext> BuildContext(
        List<Product>? products = null,
        List<Category>? categories = null,
        List<Brand>? brands = null,
        List<Inventory>? inventories = null)
    {
        var ctx = new Mock<IApplicationDbContext>();

        ctx.Setup(x => x.Products).Returns((products ?? new()).AsQueryable().BuildMockDbSet().Object);
        ctx.Setup(x => x.Categories).Returns((categories ?? new()).AsQueryable().BuildMockDbSet().Object);
        ctx.Setup(x => x.Brands).Returns((brands ?? new()).AsQueryable().BuildMockDbSet().Object);
        ctx.Setup(x => x.Inventories).Returns((inventories ?? new()).AsQueryable().BuildMockDbSet().Object);
        ctx.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        return ctx;
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateProduct()
    {
        var category = Category.Create("Electronics");
        var brand = Brand.Create("TechPro");
        var ctx = BuildContext(categories: new() { category }, brands: new() { brand });

        var cacheMock = new Mock<ICacheService>();
        cacheMock.Setup(x => x.RemoveByPatternAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new CreateProductCommand(
            "Test Laptop", "A great laptop", null, 999.99m, null, 500m,
            "LAP-TEST-001", null, 1.5m, null, null,
            category.Id, brand.Id, 100, 10);

        var handler = new CreateProductCommandHandler(ctx.Object, cacheMock.Object);
        var productId = await handler.Handle(command, CancellationToken.None);

        productId.Should().NotBeEmpty();
        ctx.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithDuplicateSku_ShouldThrowConflictException()
    {
        var category = Category.Create("Electronics");
        var brand = Brand.Create("TechPro");
        var existingProduct = Product.Create("Existing", "Desc", 100m, 50m, "EXISTING-SKU", category.Id, brand.Id);
        var ctx = BuildContext(
            products: new() { existingProduct },
            categories: new() { category },
            brands: new() { brand });

        var command = new CreateProductCommand(
            "New Product", "Desc", null, 50m, null, 25m, "EXISTING-SKU", null, 0.5m, null, null,
            category.Id, brand.Id);

        var handler = new CreateProductCommandHandler(ctx.Object, new Mock<ICacheService>().Object);

        await Assert.ThrowsAsync<ConflictException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithInvalidCategory_ShouldThrowNotFoundException()
    {
        var ctx = BuildContext();

        var command = new CreateProductCommand(
            "Product", "Desc", null, 50m, null, 25m, "SKU-001", null, 0.5m, null, null,
            Guid.NewGuid(), Guid.NewGuid());

        var handler = new CreateProductCommandHandler(ctx.Object, new Mock<ICacheService>().Object);

        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(command, CancellationToken.None));
    }
}
