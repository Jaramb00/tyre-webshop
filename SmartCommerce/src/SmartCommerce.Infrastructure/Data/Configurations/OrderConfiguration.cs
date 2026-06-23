using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartCommerce.Domain.Entities;

namespace SmartCommerce.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.OrderNumber).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Subtotal).HasPrecision(18, 2);
        builder.Property(x => x.TaxAmount).HasPrecision(18, 2);
        builder.Property(x => x.ShippingCost).HasPrecision(18, 2);
        builder.Property(x => x.DiscountAmount).HasPrecision(18, 2);
        builder.Property(x => x.Total).HasPrecision(18, 2);
        builder.Property(x => x.Currency).HasMaxLength(3);
        builder.Property(x => x.Notes).HasMaxLength(1000);
        builder.Property(x => x.CancellationReason).HasMaxLength(500);
        builder.Property(x => x.RowVersion).IsConcurrencyToken();

        builder.OwnsOne(x => x.ShippingAddress, a =>
        {
            a.Property(x => x.FullName).HasMaxLength(100).HasColumnName("ShippingFullName");
            a.Property(x => x.Line1).HasMaxLength(200).HasColumnName("ShippingLine1");
            a.Property(x => x.Line2).HasMaxLength(200).HasColumnName("ShippingLine2");
            a.Property(x => x.City).HasMaxLength(100).HasColumnName("ShippingCity");
            a.Property(x => x.State).HasMaxLength(100).HasColumnName("ShippingState");
            a.Property(x => x.PostalCode).HasMaxLength(20).HasColumnName("ShippingPostalCode");
            a.Property(x => x.Country).HasMaxLength(2).HasColumnName("ShippingCountry");
            a.Property(x => x.PhoneNumber).HasMaxLength(20).HasColumnName("ShippingPhoneNumber");
        });

        builder.OwnsOne(x => x.BillingAddress, a =>
        {
            a.Property(x => x.FullName).HasMaxLength(100).HasColumnName("BillingFullName");
            a.Property(x => x.Line1).HasMaxLength(200).HasColumnName("BillingLine1");
            a.Property(x => x.Line2).HasMaxLength(200).HasColumnName("BillingLine2");
            a.Property(x => x.City).HasMaxLength(100).HasColumnName("BillingCity");
            a.Property(x => x.State).HasMaxLength(100).HasColumnName("BillingState");
            a.Property(x => x.PostalCode).HasMaxLength(20).HasColumnName("BillingPostalCode");
            a.Property(x => x.Country).HasMaxLength(2).HasColumnName("BillingCountry");
            a.Property(x => x.PhoneNumber).HasMaxLength(20).HasColumnName("BillingPhoneNumber");
        });

        builder.HasIndex(x => x.OrderNumber).IsUnique();
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.CreatedAt);
        builder.HasQueryFilter(x => !x.IsDeleted);

        builder.HasOne(x => x.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Items)
            .WithOne(i => i.Order)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Payment)
            .WithOne(p => p.Order)
            .HasForeignKey<Payment>(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Shipment)
            .WithOne(s => s.Order)
            .HasForeignKey<Shipment>(s => s.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
