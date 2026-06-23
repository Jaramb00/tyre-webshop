using FluentAssertions;
using SmartCommerce.Application.Features.Auth.Commands;
using SmartCommerce.Application.Features.Auth.DTOs;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace SmartCommerce.IntegrationTests.Controllers;

[Collection("Integration")]
public class AuthControllerTests : IClassFixture<SmartCommerceWebAppFactory>
{
    private readonly HttpClient _client;
    public AuthControllerTests(SmartCommerceWebAppFactory factory) { _client = factory.CreateClient(); }

    [Fact]
    public async Task Register_WithValidData_ShouldReturnCreated()
    {
        var command = new RegisterCommand(
            "John",
            "Doe",
            $"john.doe.{Guid.NewGuid():N}@example.com",
            "SecurePassword@123",
            "SecurePassword@123");

        var response = await _client.PostAsJsonAsync("/api/v1/auth/register", command);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<AuthResponse>();
        result.Should().NotBeNull();
        result!.AccessToken.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ShouldReturnConflict()
    {
        var email = $"duplicate.{Guid.NewGuid():N}@example.com";
        var command = new RegisterCommand("John", "Doe", email, "SecurePassword@123", "SecurePassword@123");

        await _client.PostAsJsonAsync("/api/v1/auth/register", command);
        var response = await _client.PostAsJsonAsync("/api/v1/auth/register", command);

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturnOk()
    {
        var email = $"login.test.{Guid.NewGuid():N}@example.com";
        var password = "SecurePassword@123";

        await _client.PostAsJsonAsync("/api/v1/auth/register",
            new RegisterCommand("Jane", "Doe", email, password, password));

        var loginCommand = new LoginCommand(email, password);
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", loginCommand);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<AuthResponse>();
        result!.Email.Should().Be(email);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ShouldReturnUnauthorized()
    {
        var command = new LoginCommand("nonexistent@example.com", "WrongPassword");
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", command);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Register_WithWeakPassword_ShouldReturnUnprocessableEntity()
    {
        var command = new RegisterCommand("John", "Doe", "john@example.com", "weak", "weak");
        var response = await _client.PostAsJsonAsync("/api/v1/auth/register", command);

        response.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
    }
}
