using SmartCommerce.Domain.Enums;

namespace SmartCommerce.Domain.Entities;

public class Coupon : BaseEntity
{
    public string Code { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public DiscountType DiscountType { get; private set; }
    public decimal DiscountValue { get; private set; }
    public decimal? MinimumOrderAmount { get; private set; }
    public decimal? MaximumDiscountAmount { get; private set; }
    public int? UsageLimit { get; private set; }
    public int UsageCount { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime? StartsAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
    public bool IsFirstOrderOnly { get; private set; }

    private Coupon() { }

    public static Coupon Create(
        string code,
        string description,
        DiscountType type,
        decimal value,
        decimal? minOrder = null,
        decimal? maxDiscount = null,
        int? usageLimit = null,
        DateTime? expiresAt = null)
        => new()
        {
            Code = code.ToUpperInvariant(),
            Description = description,
            DiscountType = type,
            DiscountValue = value,
            MinimumOrderAmount = minOrder,
            MaximumDiscountAmount = maxDiscount,
            UsageLimit = usageLimit,
            ExpiresAt = expiresAt
        };

    public decimal CalculateDiscount(decimal orderAmount)
    {
        if (!IsValid(orderAmount)) return 0;

        var discount = DiscountType == DiscountType.Percentage
            ? orderAmount * (DiscountValue / 100)
            : DiscountValue;

        if (MaximumDiscountAmount.HasValue)
            discount = Math.Min(discount, MaximumDiscountAmount.Value);

        return Math.Min(discount, orderAmount);
    }

    public bool IsValid(decimal orderAmount)
    {
        if (!IsActive) return false;
        if (ExpiresAt.HasValue && ExpiresAt < DateTime.UtcNow) return false;
        if (StartsAt.HasValue && StartsAt > DateTime.UtcNow) return false;
        if (UsageLimit.HasValue && UsageCount >= UsageLimit) return false;
        if (MinimumOrderAmount.HasValue && orderAmount < MinimumOrderAmount) return false;
        return true;
    }

    public void IncrementUsage() => UsageCount++;
}
