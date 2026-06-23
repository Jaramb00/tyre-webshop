using FluentAssertions;
using SmartCommerce.Domain.Entities;
using SmartCommerce.Domain.Enums;
using Xunit;

namespace SmartCommerce.UnitTests.Features.Orders;

public class OrderDomainTests
{
    private static Address TestAddress() => new()
    {
        FullName = "John Doe",
        Line1 = "123 Main St",
        City = "New York",
        State = "NY",
        PostalCode = "10001",
        Country = "US"
    };

    [Fact]
    public void Create_ShouldGenerateOrderNumber()
    {
        var order = Order.Create(Guid.NewGuid(), TestAddress(), TestAddress());
        order.OrderNumber.Should().NotBeNullOrEmpty();
        order.OrderNumber.Should().StartWith("ORD-");
    }

    [Fact]
    public void Create_ShouldHavePendingStatus()
    {
        var order = Order.Create(Guid.NewGuid(), TestAddress(), TestAddress());
        order.Status.Should().Be(OrderStatus.Pending);
    }

    [Fact]
    public void Confirm_FromPending_ShouldSetConfirmedStatus()
    {
        var order = Order.Create(Guid.NewGuid(), TestAddress(), TestAddress());
        order.Confirm();
        order.Status.Should().Be(OrderStatus.Confirmed);
    }

    [Fact]
    public void Confirm_FromNonPending_ShouldThrow()
    {
        var order = Order.Create(Guid.NewGuid(), TestAddress(), TestAddress());
        order.Confirm();

        var act = () => order.Confirm();
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Cancel_ShippedOrder_ShouldThrow()
    {
        var order = Order.Create(Guid.NewGuid(), TestAddress(), TestAddress());
        order.Confirm();
        order.MarkAsProcessing();
        order.MarkAsShipped("TRACK123");

        var act = () => order.Cancel("Changed mind");
        act.Should().Throw<InvalidOperationException>().WithMessage("*shipped*");
    }

    [Fact]
    public void Cancel_PendingOrder_ShouldSetCancelledStatus()
    {
        var order = Order.Create(Guid.NewGuid(), TestAddress(), TestAddress());
        order.Cancel("No longer needed");

        order.Status.Should().Be(OrderStatus.Cancelled);
        order.CancellationReason.Should().Be("No longer needed");
        order.CancelledAt.Should().NotBeNull();
    }

    [Fact]
    public void AddItem_ShouldUpdateSubtotal()
    {
        var order = Order.Create(Guid.NewGuid(), TestAddress(), TestAddress());
        var product = CreateTestProduct(29.99m);
        var item = OrderItem.Create(order.Id, product, 3);
        order.AddItem(item);

        order.Subtotal.Should().Be(89.97m);
    }

    [Fact]
    public void SetShipping_ShouldAffectTotal()
    {
        var order = Order.Create(Guid.NewGuid(), TestAddress(), TestAddress());
        var product = CreateTestProduct(40m);
        order.AddItem(OrderItem.Create(order.Id, product, 1));
        order.SetShipping(5.99m);

        order.Total.Should().Be(45.99m);
    }

    [Fact]
    public void Create_ShouldRaiseDomainEvent()
    {
        var order = Order.Create(Guid.NewGuid(), TestAddress(), TestAddress());
        order.DomainEvents.Should().ContainSingle(e => e is Domain.Events.OrderCreatedEvent);
    }

    private static Product CreateTestProduct(decimal price)
    {
        var product = Product.Create("Test", "Desc", price, price * 0.5m, "SKU-TST", Guid.NewGuid(), Guid.NewGuid());
        return product;
    }
}
