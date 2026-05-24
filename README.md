# 🎂 Birthday Wisher Enterprise

An enterprise-grade application that stores user birthdays and automatically sends birthday wishes via **Email** and **SMS** every day at 8:00 AM.

## Tech Stack
- **Backend:** Java 17, Spring Boot 3.2, Spring Security (JWT), Spring Data JPA, Spring Mail, Quartz Scheduler
- **Frontend:** Angular 17 (standalone components, signals)
- **Database:** H2 (dev) / PostgreSQL (prod)
- **SMS:** Twilio integration (configurable)
- **Docs:** Swagger UI at `/api/swagger-ui.html`

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Node 18+
- Angular CLI 17: `npm install -g @angular/cli`

### 1. Run the Backend
```bash
cd backend
mvn spring-boot:run
# API available at http://localhost:8080/api
# H2 Console at http://localhost:8080/api/h2-console
# Swagger UI at http://localhost:8080/api/swagger-ui.html
```

### 2. Run the Frontend
```bash
cd frontend
npm install
ng serve
# App available at http://localhost:4200
```

### 3. Login
| Email | Password | Role |
|-------|----------|------|
| admin@birthday.com | Admin@123 | ADMIN |

## Configuration (`backend/src/main/resources/application.yml`)

### Email (Gmail)
```yaml
spring:
  mail:
    username: your-email@gmail.com
    password: your-gmail-app-password   # Google App Password
```

### SMS via Twilio
```yaml
twilio:
  enabled: true
  account-sid: ACxxxxxxxxxxxx
  auth-token: your-auth-token
  phone-number: +1234567890
birthday:
  notification:
    sms:
      enabled: true
```

### Scheduler Cron (default: 8:00 AM IST)
```yaml
birthday:
  scheduler:
    cron: "0 0 8 * * *"
    timezone: "Asia/Kolkata"
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login → JWT |
| GET | `/api/auth/me` | User | Current user profile |
| GET | `/api/users` | User | List all users |
| POST | `/api/users` | User | Create user |
| PUT | `/api/users/{id}` | User | Update user |
| DELETE | `/api/users/{id}` | Admin | Deactivate user |
| GET | `/api/users/birthdays/today` | User | Today's birthdays |
| GET | `/api/users/birthdays/upcoming?days=7` | User | Upcoming birthdays |
| GET | `/api/users/dashboard/stats` | User | Dashboard stats |
| POST | `/api/admin/scheduler/trigger` | Admin | Manually trigger wishes |
| POST | `/api/admin/notifications/test/{userId}` | Admin | Send test wish |
| GET | `/api/admin/notifications/logs` | Admin | View notification logs |

## Project Structure
```
birthday-app/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/birthday/
│       ├── BirthdayWisherApplication.java
│       ├── config/          # JWT, Security
│       ├── controller/      # REST endpoints
│       ├── dto/             # Request/Response objects
│       ├── entity/          # JPA entities
│       ├── exception/       # Global error handling
│       ├── repository/      # Spring Data repos
│       ├── scheduler/       # Birthday cron job
│       └── service/         # Business logic
└── frontend/
    └── src/app/
        ├── core/            # Guards, interceptors, services
        ├── features/        # Auth, Dashboard, Users, Notifications
        └── shared/          # Layout, models
```

## Production Deployment

### PostgreSQL
Replace H2 config in `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/birthdaydb
    username: postgres
    password: yourpassword
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
```
Uncomment the PostgreSQL dependency in `pom.xml`.

### Build Frontend for Production
```bash
cd frontend
ng build --configuration production
# Output in dist/birthday-wisher-ui — serve via nginx or copy to Spring Boot static resources
```
