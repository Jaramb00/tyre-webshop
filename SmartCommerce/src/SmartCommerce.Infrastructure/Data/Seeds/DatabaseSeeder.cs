using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartCommerce.Domain.Entities;

namespace SmartCommerce.Infrastructure.Data.Seeds;

public class DatabaseSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DatabaseSeeder> _logger;
    public DatabaseSeeder(ApplicationDbContext context, ILogger<DatabaseSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            await _context.Database.MigrateAsync();
            await SeedRolesAsync();
            await SeedAdminUserAsync();
            await SeedCategoriesAsync();
            await SeedBrandsAsync();
            await SeedProductsAsync();
            await SeedCouponsAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during database seeding.");
            throw;
        }
    }

    private async Task SeedRolesAsync()
    {
        if (await _context.Roles.AnyAsync()) return;

        var roles = new[]
        {
            Role.Create("Customer", "Regular customer"),
            Role.Create("Admin", "System administrator"),
            Role.Create("WarehouseWorker", "Warehouse staff"),
            Role.Create("Manager", "Store manager")
        };

        await _context.Roles.AddRangeAsync(roles);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Roles seeded.");
    }

    private async Task SeedAdminUserAsync()
    {
        if (await _context.Users.AnyAsync(u => u.Email == "admin@smartcommerce.com")) return;

        var adminRole = await _context.Roles.FirstAsync(r => r.Name == "Admin");
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Admin@12345", 12);
        var admin = User.Create("Admin", "User", "admin@smartcommerce.com", passwordHash);
        admin.ConfirmEmail();

        await _context.Users.AddAsync(admin);
        await _context.SaveChangesAsync();

        var userRole = UserRole.Create(admin.Id, adminRole.Id);
        await _context.UserRoles.AddAsync(userRole);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Admin user seeded.");
    }

    private async Task SeedCategoriesAsync()
    {
        if (await _context.Categories.AnyAsync()) return;

        var categories = new[]
        {
            Category.Create("Summer Tyres", "High-performance summer tyres for optimal grip in dry and wet conditions"),
            Category.Create("Winter Tyres", "Winter tyres engineered for safety in snow, ice, and cold temperatures"),
            Category.Create("All Season", "Year-round tyres offering versatile performance in all weather conditions"),
            Category.Create("4x4 / SUV", "Tyres designed for SUVs, off-road vehicles and 4x4 applications"),
        };

        await _context.Categories.AddRangeAsync(categories);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Tyre categories seeded.");
    }

    private async Task SeedBrandsAsync()
    {
        if (await _context.Brands.AnyAsync()) return;

        var brands = new[]
        {
            Brand.Create("Michelin", "French premium tyre manufacturer, world leader in tyre technology"),
            Brand.Create("Continental", "German engineering excellence — safety-focused tyre innovation"),
            Brand.Create("Pirelli", "Italian performance tyre manufacturer, official F1 supplier"),
            Brand.Create("Goodyear", "American tyre pioneer with over 125 years of innovation"),
            Brand.Create("Bridgestone", "Japanese precision — world's largest tyre manufacturer by revenue"),
            Brand.Create("Hankook", "South Korean tyre manufacturer with premium performance range"),
            Brand.Create("Yokohama", "Japanese high-performance specialist with motorsport heritage"),
            Brand.Create("Dunlop", "British tyre pioneer trusted by drivers worldwide since 1888"),
        };

        await _context.Brands.AddRangeAsync(brands);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Tyre brands seeded.");
    }

    private async Task SeedProductsAsync()
    {
        if (await _context.Products.AnyAsync()) return;

        var summer = await _context.Categories.FirstAsync(c => c.Name == "Summer Tyres");
        var winter = await _context.Categories.FirstAsync(c => c.Name == "Winter Tyres");
        var allSeason = await _context.Categories.FirstAsync(c => c.Name == "All Season");

        var michelin = await _context.Brands.FirstAsync(b => b.Name == "Michelin");
        var continental = await _context.Brands.FirstAsync(b => b.Name == "Continental");
        var pirelli = await _context.Brands.FirstAsync(b => b.Name == "Pirelli");
        var goodyear = await _context.Brands.FirstAsync(b => b.Name == "Goodyear");
        var bridgestone = await _context.Brands.FirstAsync(b => b.Name == "Bridgestone");
        var hankook = await _context.Brands.FirstAsync(b => b.Name == "Hankook");
        var yokohama = await _context.Brands.FirstAsync(b => b.Name == "Yokohama");
        var dunlop = await _context.Brands.FirstAsync(b => b.Name == "Dunlop");

        // NOTE: All products below are demo placeholders — will be replaced with real catalogue
        var products = new List<(Product product, decimal compareAt, string shortDesc, bool featured, int stock)>
        {
            // ── Summer Tyres ─────────────────────────────────────────────────────────
            (
                Product.Create(
                    "Michelin Pilot Sport 5 225/45 R17",
                    "The Michelin Pilot Sport 5 redefines the benchmark for ultra-high-performance summer tyres. " +
                    "Featuring an innovative Bi-compound tread with an asymmetric pattern, it delivers exceptional " +
                    "dry braking performance, progressive handling, and outstanding wet-road safety. " +
                    "Engineered with Track Link Technology for motorsport-derived grip and longevity.",
                    189.99m, 130.00m, "MPS5-225-45-17",
                    summer.Id, michelin.Id, 9.5m
                ),
                219.99m,
                "Ultra-high-performance summer tyre with outstanding wet and dry braking. Motorsport DNA.",
                true, 32
            ),
            (
                Product.Create(
                    "Continental PremiumContact 7 205/55 R16",
                    "The Continental PremiumContact 7 sets new standards in balanced all-round performance. " +
                    "SportPlus Technology combined with an optimised compound delivers shorter braking distances " +
                    "in both wet and dry conditions, while the advanced groove design ensures superior aquaplaning " +
                    "resistance for maximum safety on summer roads.",
                    142.50m, 98.00m, "CPC7-205-55-16",
                    summer.Id, continental.Id, 8.5m
                ),
                165.00m,
                "Balanced premium summer tyre. Shorter braking, excellent wet safety.",
                true, 48
            ),
            (
                Product.Create(
                    "Pirelli P Zero 245/40 R18",
                    "The Pirelli P Zero is the official tyre of Formula 1 road car homologation. " +
                    "Born on the racetrack and engineered for the world's most demanding sports cars, " +
                    "the P Zero offers razor-sharp steering response, ultra-precise handling at the limit, " +
                    "and class-leading cornering stability. The asymmetric tread pattern maximises contact " +
                    "patch grip in both dry and light-wet conditions.",
                    229.00m, 158.00m, "PZ-245-40-18",
                    summer.Id, pirelli.Id, 11.2m
                ),
                0m,
                "Official F1 tyre homologation. Razor-sharp handling and cornering precision.",
                true, 12
            ),
            (
                Product.Create(
                    "Goodyear Eagle F1 Asymmetric 6 225/50 R17",
                    "The Goodyear Eagle F1 Asymmetric 6 is engineered for drivers who demand maximum " +
                    "performance without compromising daily usability. Its ActiveBraking Technology " +
                    "maximises the contact patch under braking, while the refined compound ensures " +
                    "responsive handling and strong lateral grip. Ideal for sports saloons and hot hatches.",
                    165.00m, 114.00m, "GEF1A6-225-50-17",
                    summer.Id, goodyear.Id, 10.0m
                ),
                189.00m,
                "ActiveBraking Technology for shorter stops. Perfect for sports saloons.",
                false, 28
            ),
            (
                Product.Create(
                    "Bridgestone Turanza T005 195/65 R15",
                    "The Bridgestone Turanza T005 is designed to deliver outstanding wet-road safety " +
                    "and a comfortable, refined ride for everyday drivers. DriveGuard technology ensures " +
                    "extended mobility even after a puncture. The optimised contact shape provides even " +
                    "wear and a longer tyre life.",
                    98.00m, 67.00m, "BT005-195-65-15",
                    summer.Id, bridgestone.Id, 7.8m
                ),
                0m,
                "Premium touring summer tyre with exceptional wet safety and comfort.",
                false, 64
            ),
            (
                Product.Create(
                    "Hankook Ventus S1 Evo 3 225/45 R18",
                    "The Hankook Ventus S1 Evo 3 is the flagship ultra-high-performance tyre from " +
                    "Hankook, developed in partnership with Porsche and BMW. Its innovative compound " +
                    "technology delivers enhanced dry grip and reduced rolling resistance, while the " +
                    "directional tread pattern optimises water evacuation for confident wet handling.",
                    155.99m, 107.00m, "HVS1E3-225-45-18",
                    summer.Id, hankook.Id, 9.8m
                ),
                179.99m,
                "Developed with Porsche & BMW. Superior performance and low rolling resistance.",
                false, 20
            ),

            // ── Winter Tyres ──────────────────────────────────────────────────────────
            (
                Product.Create(
                    "Michelin Alpin 6 205/55 R16",
                    "The Michelin Alpin 6 is engineered for maximum winter safety without sacrificing " +
                    "year-round usability. Its unique EverGrip Technology ensures progressive grip as " +
                    "the tyre wears, so that safety is maintained throughout the tyre's full life. " +
                    "The cross-Z sipes provide exceptional traction on snow and ice.",
                    148.00m, 102.00m, "MA6-205-55-16",
                    winter.Id, michelin.Id, 8.8m
                ),
                172.00m,
                "EverGrip Technology maintains safety as the tyre wears. Best-in-class winter performance.",
                true, 56
            ),
            (
                Product.Create(
                    "Continental WinterContact TS 870 225/45 R17",
                    "The Continental WinterContact TS 870 delivers outstanding braking and handling " +
                    "performance on snow and ice through its innovative IceGrip compound. " +
                    "The directional tread design efficiently disperses slush and water, while " +
                    "the 3D sipe technology maximises traction on packed snow for confident winter driving.",
                    169.00m, 116.00m, "CWT870-225-45-17",
                    winter.Id, continental.Id, 9.2m
                ),
                0m,
                "IceGrip compound for outstanding braking on snow and ice.",
                false, 42
            ),
            (
                Product.Create(
                    "Pirelli Scorpion Winter 255/50 R19",
                    "The Pirelli Scorpion Winter is purpose-built for SUVs and crossovers that demand " +
                    "peak winter performance. Its high-density sipe pattern and specialised compound " +
                    "ensure confident traction on snow and ice, while the reinforced sidewall construction " +
                    "handles the increased loads of heavier vehicles. Approved for multiple premium SUV OEMs.",
                    259.00m, 178.00m, "PSW-255-50-19",
                    winter.Id, pirelli.Id, 13.5m
                ),
                299.00m,
                "SUV-specific winter tyre. High-density sipes and reinforced sidewall.",
                false, 8
            ),
            (
                Product.Create(
                    "Goodyear UltraGrip Performance+ 215/60 R16",
                    "The Goodyear UltraGrip Performance+ is the evolution of Goodyear's acclaimed " +
                    "winter tyre range. Its PatentFlex Technology creates more biting edges on snow " +
                    "and ice to deliver exceptional traction and braking. The new compound formulation " +
                    "also improves fuel efficiency without compromising winter safety.",
                    132.50m, 91.00m, "GUGP-215-60-16",
                    winter.Id, goodyear.Id, 9.0m
                ),
                149.00m,
                "PatentFlex Technology for best-in-class snow traction and braking.",
                false, 38
            ),

            // ── All Season ────────────────────────────────────────────────────────────
            (
                Product.Create(
                    "Yokohama Advan Sport V105 235/45 R18",
                    "The Yokohama Advan Sport V105 is a premium ultra-high-performance all-season tyre " +
                    "engineered with motorsport compound technology. The asymmetric tread design with " +
                    "wide shoulder blocks provides outstanding dry cornering and braking, while the " +
                    "optimised inner groove structure ensures effective water channelling for wet safety.",
                    198.00m, 136.00m, "YAS-V105-235-45-18",
                    allSeason.Id, yokohama.Id, 10.5m
                ),
                0m,
                "Motorsport compound technology in an all-season package. Exceptional dry and wet grip.",
                false, 16
            ),
            (
                Product.Create(
                    "Dunlop Sport Maxx RT2 225/40 R18",
                    "The Dunlop Sport Maxx RT2 delivers Max Performance in a compact, lightweight construction. " +
                    "Its Multi-Radius Profile ensures consistent contact with the road through corners, " +
                    "while the carbon-reinforced compound provides improved grip and reduced wear. " +
                    "Homologated for Audi, Volkswagen, and Mercedes-Benz sports models.",
                    175.00m, 120.00m, "DSM-RT2-225-40-18",
                    allSeason.Id, dunlop.Id, 9.5m
                ),
                199.00m,
                "OE-approved for Audi, VW, Mercedes. Multi-radius profile for consistent cornering.",
                false, 24
            ),
        };

        foreach (var (product, compareAt, shortDesc, featured, stock) in products)
        {
            var imageUrl = $"https://picsum.photos/seed/tyre-{product.Sku}/600/450";

            product.UpdateDetails(
                product.Name,
                product.Description,
                shortDesc,
                product.Price,
                compareAt > 0 ? compareAt : (decimal?)null,
                product.CostPrice,
                imageUrl,
                new List<string> { imageUrl }
            );
            product.Publish();
            product.SetFeatured(featured);

            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();

            var inventory = Inventory.Create(product.Id, stock);
            await _context.Inventories.AddAsync(inventory);
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("12 demo tyre products seeded.");
    }

    private async Task SeedCouponsAsync()
    {
        if (await _context.Coupons.AnyAsync()) return;

        var coupons = new[]
        {
            Coupon.Create("PRVANARODZBA", "10% popusta za novu registraciju", Domain.Enums.DiscountType.Percentage, 10, null, 50m, 1000, DateTime.UtcNow.AddYears(1)),
            Coupon.Create("ZIMSKE20", "20 € popusta na zimske gume", Domain.Enums.DiscountType.FixedAmount, 20, 150m, null, 500, DateTime.UtcNow.AddMonths(6)),
            Coupon.Create("BESPLATNADOS", "Besplatna dostava na sve narudžbe", Domain.Enums.DiscountType.FixedAmount, 5.99m, null, null, null, DateTime.UtcNow.AddMonths(3))
        };

        await _context.Coupons.AddRangeAsync(coupons);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Coupons seeded.");
    }
}
