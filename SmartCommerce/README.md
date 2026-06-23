# SmartCommerce — Enterprise E-Commerce & Order Management Platform

> Production-grade Full Stack Application built with **ASP.NET Core 9**, **C#**, **Entity Framework Core**, **PostgreSQL**, **React + TypeScript**, **Docker**, and **Clean Architecture**.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Setup Instructions](#setup-instructions)
8. [Docker Deployment](#docker-deployment)
9. [Testing](#testing)
10. [Environment Variables](#environment-variables)

---

## Project Overview

SmartCommerce is an enterprise-grade e-commerce platform supporting four user roles:

| Role             | Capabilities                                                  |
|------------------|---------------------------------------------------------------|
| **Customer**     | Browse products, manage cart, place & track orders, reviews   |
| **Admin**        | Full system access, user management, reports                  |
| **Manager**      | Product & order management, coupon management, reports        |
| **WarehouseWorker** | Inventory management, order fulfillment, shipments         |

---

## Architecture

Clean Architecture with strict layer separation:

```
┌─────────────────────────────────────────┐
│              API Layer                   │  ← Controllers, Middleware, SignalR Hubs
├─────────────────────────────────────────┤
│           Application Layer              │  ← CQRS (MediatR), Validators, DTOs
├─────────────────────────────────────────┤
│            Domain Layer                  │  ← Entities, Domain Events, Interfaces
├─────────────────────────────────────────┤
│         Infrastructure Layer             │  ← EF Core, Redis, Stripe, SendGrid
└─────────────────────────────────────────┘
```

### Key Patterns

- **CQRS** via MediatR — Commands and Queries are strictly separated
- **Repository + Unit of Work** — Abstracts data access behind interfaces
- **Domain Events** — Decoupled side effects (notifications, emails, audit logs)
- **Pipeline Behaviors** — Validation → Logging → Performance → Handler
- **Soft Deletes** — Global query filter; nothing is hard-deleted
- **Optimistic Concurrency** — `RowVersion` on all entities
- **Audit Fields** — `CreatedAt`, `UpdatedAt`, `CreatedBy`, `DeletedAt` on every entity

---

## Tech Stack

### Backend
| Concern | Technology |
|---|---|
| Framework | ASP.NET Core 9 |
| ORM | Entity Framework Core 9 + Npgsql |
| Database | PostgreSQL 16 |
| Cache | Redis 7 + StackExchange.Redis |
| Auth | JWT Bearer + Refresh Tokens |
| CQRS | MediatR 12 |
| Validation | FluentValidation 11 |
| Mapping | AutoMapper 13 |
| Background Jobs | Hangfire + PostgreSQL storage |
| Payments | Stripe.NET |
| Email | SendGrid |
| Weather | OpenWeatherMap API |
| Currency | ExchangeRate-API |
| Real-Time | SignalR |
| Logging | Serilog (Console + File + PostgreSQL) |
| Observability | OpenTelemetry + Prometheus + Grafana |
| HTTP Resilience | Polly (Retry + Circuit Breaker) |
| API Versioning | Asp.Versioning |
| Documentation | Swagger / OpenAPI |
| Rate Limiting | ASP.NET Core RateLimiter |

### Frontend
| Concern | Technology |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| State Management | Redux Toolkit |
| Server State | React Query (TanStack Query v5) |
| Forms | React Hook Form + Zod |
| UI Library | Material UI v6 |
| Charts | Recharts |
| Real-Time | @microsoft/signalr |
| HTTP Client | Axios (with auto-refresh interceptor) |
| Notifications | Notistack |

### DevOps
| Concern | Technology |
|---|---|
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Reverse Proxy | Nginx (frontend) |
| Metrics | Prometheus |
| Dashboards | Grafana |
| Health Checks | ASP.NET Core Health Checks |

---

## Project Structure

```
SmartCommerce/
├── src/
│   ├── SmartCommerce.Domain/          # Core business entities, events, interfaces
│   │   ├── Entities/                  # User, Product, Order, Cart, Payment, ...
│   │   ├── Enums/                     # OrderStatus, PaymentStatus, etc.
│   │   ├── Events/                    # Domain events (OrderCreated, LowStock, ...)
│   │   ├── Interfaces/                # IRepository, IUnitOfWork
│   │   └── ValueObjects/              # Address record
│   │
│   ├── SmartCommerce.Application/     # Use cases, CQRS
│   │   ├── Common/
│   │   │   ├── Behaviors/             # Validation, Logging, Performance pipelines
│   │   │   ├── Exceptions/            # NotFoundException, ValidationException, ...
│   │   │   ├── Interfaces/            # IApplicationDbContext, IJwtService, ...
│   │   │   └── Models/                # Result<T>, PaginatedList<T>
│   │   ├── Features/
│   │   │   ├── Auth/                  # Login, Register, RefreshToken commands
│   │   │   ├── Products/              # CRUD + Search + Reviews
│   │   │   ├── Cart/                  # AddToCart, UpdateQuantity, Clear
│   │   │   ├── Orders/                # Create, Cancel, Track, History
│   │   │   ├── Payments/              # PaymentIntent, Confirm, Refund
│   │   │   ├── Inventory/             # Stock management, low-stock queries
│   │   │   └── Reports/               # Sales, activity reports
│   │   └── DependencyInjection.cs
│   │
│   ├── SmartCommerce.Infrastructure/  # Persistence, external services
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   ├── Configurations/        # EF Fluent API configs
│   │   │   ├── Migrations/            # EF migrations
│   │   │   └── Seeds/                 # DatabaseSeeder
│   │   ├── Identity/                  # JwtService, BCrypt
│   │   ├── Caching/                   # RedisCacheService
│   │   ├── ExternalServices/
│   │   │   ├── Stripe/                # StripePaymentService
│   │   │   ├── SendGrid/              # SendGridEmailService
│   │   │   ├── OpenWeather/           # OpenWeatherService
│   │   │   └── ExchangeRate/          # ExchangeRateService
│   │   ├── BackgroundJobs/            # Hangfire jobs
│   │   └── DependencyInjection.cs
│   │
│   ├── SmartCommerce.API/             # Presentation layer
│   │   ├── Controllers/V1/            # Auth, Products, Orders, Cart, Payments, ...
│   │   ├── Middleware/                # GlobalExceptionHandling, RequestLogging
│   │   ├── Hubs/                      # OrderHub, NotificationHub (SignalR)
│   │   ├── Services/                  # CurrentUserService
│   │   └── Program.cs
│   │
│   └── SmartCommerce.Frontend/        # React + TypeScript SPA
│       └── src/
│           ├── api/                   # Axios client + typed API modules
│           ├── app/                   # Redux store + slices
│           ├── components/            # Reusable UI components
│           ├── pages/                 # Route-level pages (+ admin/)
│           ├── hooks/                 # Custom React hooks
│           └── types/                 # TypeScript interfaces
│
├── tests/
│   ├── SmartCommerce.UnitTests/       # Domain + Application tests (xUnit + Moq)
│   └── SmartCommerce.IntegrationTests/# API tests (Testcontainers)
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.frontend
│   ├── nginx.conf
│   └── prometheus.yml
│
├── .github/workflows/ci-cd.yml
├── docker-compose.yml
└── SmartCommerce.sln
```

---

## Database Schema

### Core Entities

```
Users ──< UserRoles >── Roles
Users ──< Orders ──< OrderItems >── Products
Users ──  Cart ──< CartItems >── Products
Users ──< Reviews >── Products
Users ──< Notifications

Products >── Categories
Products >── Brands
Products ──  Inventory

Orders ──  Payment
Orders ──  Shipment
Orders >── Coupon

AuditLog (standalone)
```

### Key Design Decisions

- All entities inherit `BaseEntity` (Id, CreatedAt, UpdatedAt, IsDeleted, RowVersion)
- `Address` is an **owned value object** (stored inline in Orders and Users)
- `IsDeleted` global query filters ensure soft-deleted records are invisible
- `RowVersion` byte array provides EF optimistic concurrency out of the box
- `ImageUrls` stored as comma-separated string (EF value conversion)

---

## API Endpoints

### Auth `/api/v1/auth`
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register new customer | Public |
| POST | `/login` | Login, returns JWT pair | Public |
| POST | `/refresh-token` | Refresh access token | Public |
| GET | `/profile` | Get current user profile | Customer+ |
| POST | `/logout` | Revoke refresh token | Customer+ |

### Products `/api/v1/products`
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/` | Paginated search (filter, sort) | Public |
| GET | `/{id}` | Product by ID | Public |
| GET | `/slug/{slug}` | Product by slug | Public |
| POST | `/` | Create product | Admin/Manager |
| PUT | `/{id}` | Update product | Admin/Manager |
| DELETE | `/{id}` | Soft delete | Admin |
| POST | `/{id}/publish` | Publish draft | Admin/Manager |
| GET | `/{id}/reviews` | Product reviews | Public |
| POST | `/{id}/reviews` | Add review | Customer |

### Cart `/api/v1/cart`
| Method | Path | Auth |
|---|---|---|
| GET | `/` | Customer |
| POST | `/items` | Customer |
| PATCH | `/items/{productId}` | Customer |
| DELETE | `/items/{productId}` | Customer |
| DELETE | `/` | Customer |

### Orders `/api/v1/orders`
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/` | Create order from cart | Customer |
| GET | `/my` | User order history | Customer |
| GET | `/{id}` | Order detail | Owner/Admin |
| POST | `/{id}/cancel` | Cancel order | Owner |
| GET | `/` | All orders | Admin/Manager |
| PATCH | `/{id}/status` | Update status | Admin/Manager/Warehouse |

### Payments `/api/v1/payments`
| Method | Path | Description |
|---|---|---|
| POST | `/intent` | Create Stripe PaymentIntent |
| POST | `/confirm` | Stripe webhook confirm |
| POST | `/{id}/refund` | Issue refund |

### Inventory `/api/v1/inventory`
| Method | Path | Description |
|---|---|---|
| GET | `/{productId}` | Inventory status |
| GET | `/low-stock` | All low-stock items |
| POST | `/{productId}/add` | Restock |
| PATCH | `/{productId}/thresholds` | Update thresholds |

---

## Setup Instructions

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

### Local Development (without Docker)

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd SmartCommerce
   ```

2. **Start infrastructure**
   ```bash
   docker compose up postgres redis -d
   ```

3. **Configure backend**
   ```bash
   # Copy and edit appsettings
   cp src/SmartCommerce.API/appsettings.json src/SmartCommerce.API/appsettings.Development.json
   # Update Stripe, SendGrid, JWT keys
   ```

4. **Run database migrations & seed**
   ```bash
   cd src/SmartCommerce.API
   dotnet run
   # Seeder runs automatically on first start
   ```

5. **Run the frontend**
   ```bash
   cd src/SmartCommerce.Frontend
   npm install
   npm run dev
   ```

6. **Access the app**
   - Frontend: http://localhost:3000
   - API + Swagger: http://localhost:8080
   - Hangfire Dashboard: http://localhost:8080/hangfire

### Default Seed Credentials
| Email | Password | Role |
|---|---|---|
| admin@smartcommerce.com | Admin@12345 | Admin |

---

## Docker Deployment

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your secrets

# Build and start all services
docker compose up -d --build

# Check logs
docker compose logs -f api

# Stop
docker compose down
```

### Environment File (`.env`)
```env
POSTGRES_PASSWORD=your_secure_password
JWT_SECRET_KEY=your_32+_char_secret
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG....
OPENWEATHER_API_KEY=...
EXCHANGERATE_API_KEY=...
GRAFANA_PASSWORD=admin
```

### Service URLs (Docker)
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8080 |
| Swagger | http://localhost:8080/index.html |
| Hangfire | http://localhost:8080/hangfire |
| Grafana | http://localhost:3001 |
| Prometheus | http://localhost:9090 |

---

## Testing

### Unit Tests

```bash
dotnet test tests/SmartCommerce.UnitTests/ -v normal
```

Tests cover:
- Domain entity invariants (`Order`, `Cart`, `Inventory`, `Product`)
- Application command handlers (`CreateProduct`, etc.)
- Infrastructure services (`JwtService`)

### Integration Tests

Requires Docker (uses Testcontainers for PostgreSQL + Redis):

```bash
dotnet test tests/SmartCommerce.IntegrationTests/ -v normal
```

Tests cover:
- Auth endpoints (register, login, refresh, duplicate email)
- Product CRUD endpoints
- Order lifecycle

### Coverage Report

```bash
dotnet test SmartCommerce.sln \
  --collect:"XPlat Code Coverage" \
  --results-directory coverage

# Generate HTML report (requires reportgenerator tool)
reportgenerator -reports:coverage/**/*.xml -targetdir:coverage/html -reporttypes:Html
```

Target: **≥ 80% line coverage**

### Frontend Tests

```bash
cd src/SmartCommerce.Frontend
npm run test
npm run test:coverage
```

---

## Hangfire Background Jobs

| Job | Schedule | Description |
|---|---|---|
| `daily-sales-report` | Daily at 6:00 AM | Generates and emails sales report |
| `inventory-check` | Every hour | Alerts on low-stock products |
| `abandoned-carts` | Daily at 9:00 AM | Emails customers with abandoned carts |
| `customer-activity` | Weekly | Generates customer activity report |

---

## Real-Time Features (SignalR)

### Hubs

- **`/hubs/orders`** — Live order status updates. Clients join `order-{id}` group.
- **`/hubs/notifications`** — Per-user notifications. Auto-joins `user-{userId}` group.

### Frontend Connection

```typescript
const connection = new HubConnectionBuilder()
  .withUrl('/hubs/orders', { accessTokenFactory: () => getAccessToken() })
  .withAutomaticReconnect()
  .build();

connection.on('OrderStatusUpdated', (update) => { /* handle */ });
await connection.start();
await connection.invoke('JoinOrderGroup', orderId);
```

---

## Security

| Measure | Implementation |
|---|---|
| Authentication | JWT Bearer (HS256, 60min expiry) |
| Refresh Tokens | 64-byte cryptographically random, 30-day expiry |
| Password Hashing | BCrypt with work factor 12 |
| Rate Limiting | Fixed window (100/min general), Sliding window (10/min auth) |
| SQL Injection | Parameterized queries via EF Core |
| XSS | Security headers via Nginx |
| CORS | Strict origin allowlist |
| Soft Deletes | Prevents accidental data loss |
| Optimistic Concurrency | Prevents lost updates |

---

## Monitoring

- **Prometheus** scrapes `/metrics` every 10s
- **Grafana** dashboards for API latency, error rates, request throughput
- **Serilog** structured logs to Console + rolling File
- **OpenTelemetry** traces for ASP.NET Core + HttpClient + EF Core
- **Health checks** at `/health` (PostgreSQL + Redis)
