using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Infrastructure.Data;

namespace SmartCommerce.Infrastructure.BackgroundJobs;

public class SalesReportJob
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<SalesReportJob> _logger;
    public SalesReportJob(ApplicationDbContext context, IEmailService emailService, ILogger<SalesReportJob> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    [AutomaticRetry(Attempts = 3)]
    public async Task GenerateDailySalesReportAsync()
    {
        _logger.LogInformation("Generating daily sales report...");
        var yesterday = DateTime.UtcNow.Date.AddDays(-1);

        var orders = await _context.Orders
            .Where(o => o.CreatedAt >= yesterday && o.CreatedAt < yesterday.AddDays(1))
            .ToListAsync();

        var totalRevenue = orders.Sum(o => o.Total);
        var orderCount = orders.Count;

        var reportBody = $@"
            <h1>Daily Sales Report - {yesterday:yyyy-MM-dd}</h1>
            <p>Total Orders: {orderCount}</p>
            <p>Total Revenue: ${totalRevenue:F2}</p>
            <p>Average Order Value: ${(orderCount > 0 ? totalRevenue / orderCount : 0):F2}</p>";

        await _emailService.SendEmailAsync("manager@smartcommerce.com", $"Daily Sales Report - {yesterday:yyyy-MM-dd}", reportBody);
        _logger.LogInformation("Daily sales report sent. Orders: {Count}, Revenue: {Revenue}", orderCount, totalRevenue);
    }
}

public class InventoryCheckJob
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly ILogger<InventoryCheckJob> _logger;
    public InventoryCheckJob(ApplicationDbContext context, INotificationService notificationService, ILogger<InventoryCheckJob> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _logger = logger;
    }

    [AutomaticRetry(Attempts = 3)]
    public async Task CheckLowStockAsync()
    {
        var lowStockItems = await _context.Inventories
            .Include(i => i.Product)
            .Where(i => i.QuantityInStock <= i.LowStockThreshold && !i.Product.IsDeleted)
            .ToListAsync();

        foreach (var item in lowStockItems)
        {
            _logger.LogWarning("Low stock alert: {Product} has {Qty} units remaining", item.Product.Name, item.QuantityInStock);
            await _notificationService.SendToRoleAsync(
                "WarehouseWorker",
                "Low Stock Alert",
                $"Product '{item.Product.Name}' has only {item.QuantityInStock} units remaining.",
                Domain.Enums.NotificationType.LowStock);
        }
    }
}

public class AbandonedCartJob
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<AbandonedCartJob> _logger;
    public AbandonedCartJob(ApplicationDbContext context, IEmailService emailService, ILogger<AbandonedCartJob> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    [AutomaticRetry(Attempts = 3)]
    public async Task NotifyAbandonedCartsAsync()
    {
        var threshold = DateTime.UtcNow.AddHours(-24);

        var abandonedCarts = await _context.Carts
            .Include(c => c.User)
            .Include(c => c.Items)
            .Where(c => c.Items.Any() && c.UpdatedAt < threshold && !c.User.IsDeleted)
            .ToListAsync();

        foreach (var cart in abandonedCarts)
        {
            await _emailService.SendEmailAsync(
                cart.User.Email,
                "You left something behind!",
                $"<h1>Hi {cart.User.FirstName}!</h1><p>You have {cart.TotalItems} items worth ${cart.SubTotal:F2} in your cart. Complete your purchase now!</p>");

            _logger.LogInformation("Abandoned cart notification sent to {Email}", cart.User.Email);
        }
    }
}

public class CustomerActivityJob
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CustomerActivityJob> _logger;
    public CustomerActivityJob(ApplicationDbContext context, ILogger<CustomerActivityJob> logger)
    {
        _context = context;
        _logger = logger;
    }

    [AutomaticRetry(Attempts = 3)]
    public async Task GenerateActivityReportAsync()
    {
        var today = DateTime.UtcNow.Date;
        var newCustomers = await _context.Users.CountAsync(u => u.CreatedAt >= today.AddDays(-7));
        var activeUsers = await _context.Orders.Select(o => o.UserId).Distinct().CountAsync();

        _logger.LogInformation("Weekly customer activity: {NewCustomers} new customers, {ActiveUsers} active users", newCustomers, activeUsers);
    }
}
