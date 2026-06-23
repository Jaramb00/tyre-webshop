using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartCommerce.Domain.Entities;

namespace SmartCommerce.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.LastName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Email).IsRequired().HasMaxLength(256);
        builder.Property(x => x.PasswordHash).IsRequired();
        builder.Property(x => x.PhoneNumber).HasMaxLength(20);
        builder.Property(x => x.AvatarUrl).HasMaxLength(500);
        builder.Property(x => x.RefreshToken).HasMaxLength(500);
        builder.Property(x => x.RowVersion).IsConcurrencyToken();

        builder.OwnsOne(x => x.DefaultAddress, a =>
        {
            a.Property(x => x.FullName).HasMaxLength(100).HasColumnName("AddressFullName");
            a.Property(x => x.Line1).HasMaxLength(200).HasColumnName("AddressLine1");
            a.Property(x => x.Line2).HasMaxLength(200).HasColumnName("AddressLine2");
            a.Property(x => x.City).HasMaxLength(100).HasColumnName("AddressCity");
            a.Property(x => x.State).HasMaxLength(100).HasColumnName("AddressState");
            a.Property(x => x.PostalCode).HasMaxLength(20).HasColumnName("AddressPostalCode");
            a.Property(x => x.Country).HasMaxLength(2).HasColumnName("AddressCountry");
            a.Property(x => x.PhoneNumber).HasMaxLength(20).HasColumnName("AddressPhone");
        });

        builder.HasIndex(x => x.Email).IsUnique();
        builder.HasQueryFilter(x => !x.IsDeleted);

        builder.HasMany(x => x.UserRoles)
            .WithOne(ur => ur.User)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Cart)
            .WithOne(c => c.User)
            .HasForeignKey<Cart>(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
