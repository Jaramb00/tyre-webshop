using FluentAssertions;
using Microsoft.Extensions.Options;
using Xunit;
using SmartCommerce.Domain.Entities;
using SmartCommerce.Infrastructure.Identity;

namespace SmartCommerce.UnitTests.Services;

public class JwtServiceTests
{
    private readonly JwtService _jwtService;
    private readonly JwtSettings _settings;

    public JwtServiceTests()
    {
        _settings = new JwtSettings
        {
            SecretKey = "TestSecretKey_MustBeAtLeast32Characters_ForHS256!",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
            AccessTokenExpiryMinutes = 60,
            RefreshTokenExpiryDays = 30
        };
        _jwtService = new JwtService(Options.Create(_settings));
    }

    [Fact]
    public void GenerateAccessToken_ValidUser_ShouldReturnToken()
    {
        var user = User.Create("John", "Doe", "john@example.com", "hash");
        var token = _jwtService.GenerateAccessToken(user, new List<string> { "Customer" });

        token.Should().NotBeNullOrEmpty();
        token.Split('.').Should().HaveCount(3); // JWT format
    }

    [Fact]
    public void ValidateAccessToken_ValidToken_ShouldReturnUserId()
    {
        var user = User.Create("John", "Doe", "john@example.com", "hash");
        var token = _jwtService.GenerateAccessToken(user, new List<string> { "Customer" });

        var userId = _jwtService.ValidateAccessToken(token);

        userId.Should().Be(user.Id);
    }

    [Fact]
    public void ValidateAccessToken_InvalidToken_ShouldReturnNull()
    {
        var userId = _jwtService.ValidateAccessToken("invalid.token.here");
        userId.Should().BeNull();
    }

    [Fact]
    public void GenerateRefreshToken_ShouldReturnUniqueTokens()
    {
        var token1 = _jwtService.GenerateRefreshToken();
        var token2 = _jwtService.GenerateRefreshToken();

        token1.Should().NotBeNullOrEmpty();
        token2.Should().NotBeNullOrEmpty();
        token1.Should().NotBe(token2);
    }
}
