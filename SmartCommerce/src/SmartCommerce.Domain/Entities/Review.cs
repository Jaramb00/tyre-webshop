namespace SmartCommerce.Domain.Entities;

public class Review : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    public int Rating { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public bool IsVerifiedPurchase { get; private set; }
    public bool IsApproved { get; private set; }
    public int HelpfulVotes { get; private set; }

    private Review() { }

    public static Review Create(Guid productId, Guid userId, int rating, string title, string body, bool isVerifiedPurchase = false)
    {
        if (rating < 1 || rating > 5) throw new ArgumentException("Rating must be between 1 and 5.");
        return new Review
        {
            ProductId = productId,
            UserId = userId,
            Rating = rating,
            Title = title,
            Body = body,
            IsVerifiedPurchase = isVerifiedPurchase
        };
    }

    public void Approve()
    {
        IsApproved = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(int rating, string title, string body)
    {
        if (rating < 1 || rating > 5) throw new ArgumentException("Rating must be between 1 and 5.");
        Rating = rating;
        Title = title;
        Body = body;
        IsApproved = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkHelpful() => HelpfulVotes++;
}
