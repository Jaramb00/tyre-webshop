using Microsoft.AspNetCore.Mvc;
using SmartCommerce.Application.Common.Exceptions;
using System.Text.Json;

namespace SmartCommerce.API.Middleware;

public class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;
    public GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred. TraceId: {TraceId}", context.TraceIdentifier);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/problem+json";

        var (statusCode, title, errors) = exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, "Not Found", null),
            ValidationException ve => (StatusCodes.Status422UnprocessableEntity, "Validation Error", ve.Errors),
            UnauthorizedException => (StatusCodes.Status401Unauthorized, "Unauthorized", null),
            ForbiddenException => (StatusCodes.Status403Forbidden, "Forbidden", null),
            ConflictException => (StatusCodes.Status409Conflict, "Conflict", null),
            BusinessRuleException => (StatusCodes.Status400BadRequest, "Business Rule Violation", null),
            _ => (StatusCodes.Status500InternalServerError, "Internal Server Error", null)
        };

        context.Response.StatusCode = statusCode;

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = exception.Message,
            Instance = context.Request.Path,
            Extensions = { ["traceId"] = context.TraceIdentifier }
        };

        if (errors != null)
            problemDetails.Extensions["errors"] = errors;

        var json = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
