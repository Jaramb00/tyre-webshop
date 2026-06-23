using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartCommerce.Domain.Entities;

namespace SmartCommerce.Infrastructure.Data.Configurations;

public class ShipmentConfiguration : IEntityTypeConfiguration<Shipment>
{
    public void Configure(EntityTypeBuilder<Shipment> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TrackingNumber).HasMaxLength(100);
        builder.Property(x => x.Carrier).HasMaxLength(100);
        builder.Property(x => x.Notes).HasMaxLength(1000);
        builder.Property(x => x.WeatherCondition).HasMaxLength(200);
        builder.Property(x => x.Weight).HasPrecision(10, 3);

        builder.OwnsOne(x => x.ToAddress, a =>
        {
            a.Property(x => x.FullName).HasMaxLength(100).HasColumnName("ToFullName");
            a.Property(x => x.Line1).HasMaxLength(200).HasColumnName("ToLine1");
            a.Property(x => x.Line2).HasMaxLength(200).HasColumnName("ToLine2");
            a.Property(x => x.City).HasMaxLength(100).HasColumnName("ToCity");
            a.Property(x => x.State).HasMaxLength(100).HasColumnName("ToState");
            a.Property(x => x.PostalCode).HasMaxLength(20).HasColumnName("ToPostalCode");
            a.Property(x => x.Country).HasMaxLength(2).HasColumnName("ToCountry");
            a.Property(x => x.PhoneNumber).HasMaxLength(20).HasColumnName("ToPhoneNumber");
        });

        builder.OwnsOne(x => x.FromAddress, a =>
        {
            a.Property(x => x.FullName).HasMaxLength(100).HasColumnName("FromFullName");
            a.Property(x => x.Line1).HasMaxLength(200).HasColumnName("FromLine1");
            a.Property(x => x.Line2).HasMaxLength(200).HasColumnName("FromLine2");
            a.Property(x => x.City).HasMaxLength(100).HasColumnName("FromCity");
            a.Property(x => x.State).HasMaxLength(100).HasColumnName("FromState");
            a.Property(x => x.PostalCode).HasMaxLength(20).HasColumnName("FromPostalCode");
            a.Property(x => x.Country).HasMaxLength(2).HasColumnName("FromCountry");
            a.Property(x => x.PhoneNumber).HasMaxLength(20).HasColumnName("FromPhoneNumber");
        });

        builder.HasIndex(x => x.OrderId);
        builder.HasIndex(x => x.TrackingNumber);
        builder.HasIndex(x => x.Status);
    }
}
