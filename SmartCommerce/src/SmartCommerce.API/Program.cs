using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using Hangfire;
using Microsoft.AspNetCore.RateLimiting;
using Serilog;
using SmartCommerce.API.Hubs;
using SmartCommerce.API.Middleware;
using SmartCommerce.Application;
using SmartCommerce.Infrastructure;
using SmartCommerce.Infrastructure.BackgroundJobs;
using SmartCommerce.Infrastructure.Data.Seeds;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithEnvironmentName()
    .CreateLogger();

builder.Host.UseSerilog();

// Services
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// API Versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new HeaderApiVersionReader("X-API-Version"));
}).AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

// Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "SmartCommerce API", Version = "v1", Description = "Enterprise E-Commerce Platform API" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer",
        Description = "Enter JWT token"
    });
    c.AddSecurityRequirement(new()
    {
        {
            new() { Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } },
            new List<string>()
        }
    });
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath)) c.IncludeXmlComments(xmlPath);
});

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("fixed", opt =>
    {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 10;
    });

    options.AddSlidingWindowLimiter("auth", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.SegmentsPerWindow = 6;
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(builder.Configuration["Frontend:Url"] ?? "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// SignalR
builder.Services.AddSignalR();

// HttpContextAccessor
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<SmartCommerce.Application.Common.Interfaces.ICurrentUserService, SmartCommerce.API.Services.CurrentUserService>();
builder.Services.AddScoped<SmartCommerce.Application.Common.Interfaces.INotificationService, SmartCommerce.API.Services.NotificationService>();

// Health Checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Seed database
if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Docker"))
{
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    await seeder.SeedAsync();
}

// Middleware pipeline
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Docker"))
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartCommerce API v1");
        c.RoutePrefix = string.Empty;
    });
}

if (app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.UseOpenTelemetryPrometheusScrapingEndpoint();

app.MapControllers();
app.MapHealthChecks("/health");
app.MapHangfireDashboard("/hangfire");
app.MapHub<OrderHub>("/hubs/orders");
app.MapHub<NotificationHub>("/hubs/notifications");

// Register Hangfire recurring jobs
var recurringJobs = app.Services.GetRequiredService<IRecurringJobManager>();
recurringJobs.AddOrUpdate<SalesReportJob>("daily-sales-report", j => j.GenerateDailySalesReportAsync(), Cron.Daily(6));
recurringJobs.AddOrUpdate<InventoryCheckJob>("inventory-check", j => j.CheckLowStockAsync(), Cron.Hourly);
recurringJobs.AddOrUpdate<AbandonedCartJob>("abandoned-carts", j => j.NotifyAbandonedCartsAsync(), Cron.Daily(9));
recurringJobs.AddOrUpdate<CustomerActivityJob>("customer-activity", j => j.GenerateActivityReportAsync(), Cron.Weekly());

try
{
    Log.Information("Starting SmartCommerce API...");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application startup failed.");
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program { }
