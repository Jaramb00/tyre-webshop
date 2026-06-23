using FluentAssertions;
using SmartCommerce.Domain.Entities;
using Xunit;
using Cart = SmartCommerce.Domain.Entities.Cart;
using Inventory = SmartCommerce.Domain.Entities.Inventory;

namespace SmartCommerce.UnitTests.Features.CartTests;

public class CartDomainTests
{
    private static Product CreateProduct(decimal price, int stock = 100)
    {
        var product = Product.Create("Test Product", "Description", price, price * 0.5m, $"SKU-{Guid.NewGuid():N}"[..15], Guid.NewGuid(), Guid.NewGuid());
        var inventory = Inventory.Create(product.Id, stock);
        return product;
    }

    [Fact]
    public void AddItem_NewProduct_ShouldAddItemToCart()
    {
        var cart = Cart.Create(Guid.NewGuid());
        var product = CreateProduct(19.99m);

        cart.AddItem(product, 2);

        cart.Items.Should().HaveCount(1);
        cart.TotalItems.Should().Be(2);
        cart.SubTotal.Should().Be(39.98m);
    }

    [Fact]
    public void AddItem_ExistingProduct_ShouldIncreaseQuantity()
    {
        var cart = Cart.Create(Guid.NewGuid());
        var product = CreateProduct(10m);

        cart.AddItem(product, 2);
        cart.AddItem(product, 3);

        cart.Items.Should().HaveCount(1);
        cart.TotalItems.Should().Be(5);
    }

    [Fact]
    public void UpdateItemQuantity_Zero_ShouldRemoveItem()
    {
        var cart = Cart.Create(Guid.NewGuid());
        var product = CreateProduct(10m);
        cart.AddItem(product, 2);

        cart.UpdateItemQuantity(product.Id, 0);

        cart.Items.Should().BeEmpty();
    }

    [Fact]
    public void RemoveItem_ShouldDecreaseTotalItems()
    {
        var cart = Cart.Create(Guid.NewGuid());
        var product1 = CreateProduct(10m);
        var product2 = CreateProduct(20m);
        cart.AddItem(product1, 1);
        cart.AddItem(product2, 2);

        cart.RemoveItem(product1.Id);

        cart.Items.Should().HaveCount(1);
        cart.SubTotal.Should().Be(40m);
    }

    [Fact]
    public void Clear_ShouldRemoveAllItems()
    {
        var cart = Cart.Create(Guid.NewGuid());
        cart.AddItem(CreateProduct(10m), 1);
        cart.AddItem(CreateProduct(20m), 1);

        cart.Clear();

        cart.Items.Should().BeEmpty();
        cart.SubTotal.Should().Be(0m);
    }

    [Fact]
    public void UpdateItemQuantity_NonexistentProduct_ShouldThrow()
    {
        var cart = Cart.Create(Guid.NewGuid());

        var act = () => cart.UpdateItemQuantity(Guid.NewGuid(), 5);
        act.Should().Throw<InvalidOperationException>();
    }
}
