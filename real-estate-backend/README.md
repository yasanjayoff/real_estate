# Smart Real Estate Deal & Profit Management System — Backend

Spring Boot REST API with JWT Authentication, Role-Based Access Control, and MySQL.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Spring Boot 3.2 |
| Language | Java 17 |
| Database | MySQL 8 |
| Security | Spring Security + JWT |
| ORM | Spring Data JPA / Hibernate |
| Build Tool | Maven |
| Mapping | ModelMapper |

---

## Project Structure

```
src/main/java/com/realestate/
├── config/
│   ├── AppConfig.java          # ModelMapper + UserDetailsService bean
│   ├── DataInitializer.java    # Seeds default admin user
│   └── SecurityConfig.java     # JWT + CORS + Role rules
├── controller/
│   ├── AuthController.java     # /api/auth/login, /register
│   ├── UserController.java     # /api/users (ADMIN only)
│   ├── PropertyController.java # /api/properties
│   ├── DealController.java     # /api/deals
│   ├── VisitController.java    # /api/visits
│   ├── DocumentController.java # /api/documents
│   └── ProfitController.java   # /api/profits
├── dto/                        # Request/Response DTOs
├── entity/                     # JPA Entities
├── enums/                      # Role, Status enums
├── exception/                  # Exception handling
├── repository/                 # Spring Data JPA repos
├── security/                   # JwtUtil, JwtAuthFilter
└── service/                    # Business logic
```

---

## Setup Instructions

### 1. Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8+

### 2. Database
```sql
CREATE DATABASE real_estate_db;
```

### 3. Configure `application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/real_estate_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 4. Run
```bash
mvn spring-boot:run
```
The app runs at: **http://localhost:8080**

### 5. Default Admin Credentials
```
Email:    admin@realestate.com
Password: Admin@123
```

---

## Roles & Access

| Role | Description | Access |
|---|---|---|
| `ADMIN` | Full system access | All endpoints |
| `AGENT` | Manages deals, visits, properties | Properties, Deals, Visits, Docs, Profits |
| `SELLER` | Property owner | Create/update own properties |
| `BUYER` | Property buyer | View properties, schedule visits |

---

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login → returns JWT |
| POST | `/api/auth/register` | Public | Register new user |

### Users (ADMIN only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Get all users |
| GET | `/api/users/{id}` | Get user by ID |
| GET | `/api/users/role/{role}` | Get users by role |
| POST | `/api/users` | Create user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Soft-delete (deactivate) |
| DELETE | `/api/users/{id}/hard` | Hard delete |

### Properties
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/properties` | All | Get all (supports filters) |
| GET | `/api/properties/{id}` | All | Get by ID |
| GET | `/api/properties/owner/{id}` | All | Get by owner |
| POST | `/api/properties` | ADMIN/AGENT/SELLER | Create |
| PUT | `/api/properties/{id}` | ADMIN/AGENT/SELLER | Update |
| PATCH | `/api/properties/{id}/status` | ADMIN/AGENT | Update status |
| DELETE | `/api/properties/{id}` | ADMIN/AGENT | Delete |

Query params for GET all: `?status=AVAILABLE&type=HOUSE&city=Colombo&minPrice=1000000&maxPrice=5000000`

### Deals
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/deals` | ADMIN/AGENT | Get all deals |
| GET | `/api/deals/{id}` | Auth | Get by ID |
| GET | `/api/deals/buyer/{id}` | Auth | Get by buyer |
| GET | `/api/deals/seller/{id}` | Auth | Get by seller |
| POST | `/api/deals` | ADMIN/AGENT | Create deal |
| PUT | `/api/deals/{id}` | ADMIN/AGENT | Update deal |
| DELETE | `/api/deals/{id}` | ADMIN | Delete deal |

### Visits
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/visits` | ADMIN/AGENT | All visits |
| GET | `/api/visits/upcoming` | Auth | Upcoming visits |
| GET | `/api/visits/{id}` | Auth | By ID |
| GET | `/api/visits/buyer/{id}` | Auth | By buyer |
| GET | `/api/visits/property/{id}` | Auth | By property |
| POST | `/api/visits` | Auth | Schedule visit |
| PUT | `/api/visits/{id}` | Auth | Update visit |
| DELETE | `/api/visits/{id}` | ADMIN/AGENT | Delete visit |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/documents` | All documents |
| GET | `/api/documents/{id}` | By ID |
| GET | `/api/documents/property/{id}` | By property |
| GET | `/api/documents/deal/{id}` | By deal |
| POST | `/api/documents` | Create (multipart) |
| PUT | `/api/documents/{id}` | Update |
| DELETE | `/api/documents/{id}` | Delete |

### Profits (ADMIN/AGENT)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/profits` | All records |
| GET | `/api/profits/summary` | Total profit/commission stats |
| GET | `/api/profits/{id}` | By ID |
| GET | `/api/profits/deal/{id}` | By deal |
| POST | `/api/profits` | Create record |
| PUT | `/api/profits/{id}` | Update |
| DELETE | `/api/profits/{id}` | Delete (ADMIN only) |

---

## Request/Response Examples

### Login
```json
POST /api/auth/login
{
  "email": "admin@realestate.com",
  "password": "Admin@123"
}
```

### Create Property
```json
POST /api/properties
Authorization: Bearer <token>
{
  "title": "Luxury Villa in Colombo 7",
  "propertyType": "VILLA",
  "address": "25 Flower Road",
  "city": "Colombo",
  "district": "Western",
  "price": 35000000,
  "sizeInSqft": 3500,
  "bedrooms": 5,
  "bathrooms": 4,
  "ownerId": 2
}
```

### Create Profit Record
```json
POST /api/profits
Authorization: Bearer <token>
{
  "dealId": 1,
  "salePrice": 35000000,
  "commissionRate": 2.5,
  "expenses": 50000,
  "transactionDate": "2026-02-28"
}
```
*Commission is auto-calculated: 35,000,000 × 2.5% = 875,000. Net Profit = 875,000 − 50,000 = 825,000*

---

## Status Flows

**Property Status:** `AVAILABLE` → `UNDER_NEGOTIATION` (on deal create) → `SOLD` (on deal close) / `AVAILABLE` (on deal cancel)

**Deal Status:** `NEW` → `NEGOTIATING` → `CLOSED` / `CANCELLED`

**Visit Status:** `SCHEDULED` → `COMPLETED` / `CANCELLED` / `RESCHEDULED`

**Document Status:** `PENDING` → `VERIFIED` / `REJECTED` / `EXPIRED`
