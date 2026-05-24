# Setup Guide — Getting Dependencies

The ZIP contains all source code. Run these one-time commands to pull dependencies.

---

## Backend — Maven Dependencies

```bash
cd birthday-app/backend

# Downloads all JARs into the local Maven cache (~150MB)
mvn dependency:resolve

# Then run the app
mvn spring-boot:run
```

To create a self-contained fat JAR (includes all deps inside):
```bash
mvn package -DskipTests
java -jar target/birthday-wisher-1.0.0.jar
```

### Key dependencies pulled automatically:
| Dependency | Version | Purpose |
|---|---|---|
| spring-boot-starter-web | 3.2.0 | REST API |
| spring-boot-starter-security | 3.2.0 | JWT auth |
| spring-boot-starter-data-jpa | 3.2.0 | Database ORM |
| spring-boot-starter-mail | 3.2.0 | Email sending |
| jjwt-api | 0.11.5 | JWT tokens |
| twilio | 9.14.0 | SMS sending |
| h2 | runtime | Embedded database |
| lombok | latest | Boilerplate reduction |
| springdoc-openapi | 2.3.0 | Swagger UI |

---

## Frontend — npm Dependencies

```bash
cd birthday-app/frontend

# Downloads node_modules (~300MB)
npm install

# Run dev server
ng serve
# or: npx ng serve
```

### Key dependencies pulled automatically:
| Package | Version | Purpose |
|---|---|---|
| @angular/core | ^17.0.0 | Framework |
| @angular/router | ^17.0.0 | Routing |
| @angular/forms | ^17.0.0 | Forms |
| @angular/animations | ^17.0.0 | Animations |
| rxjs | ~7.8.0 | Reactive streams |
| zone.js | ~0.14.2 | Change detection |
| @angular/cli (dev) | ^17.0.0 | Build tooling |

---

## Offline / Air-gapped Setup

If you need to run this without internet access after the first install:

### Backend (Maven offline bundle)
```bash
# On a machine WITH internet, run once:
mvn dependency:go-offline -f birthday-app/backend/pom.xml

# This fills ~/.m2/repository — zip it up:
zip -r maven-repo.zip ~/.m2/repository

# On the offline machine, extract to same location and run:
mvn spring-boot:run --offline
```

### Frontend (npm offline bundle)
```bash
# On a machine WITH internet:
cd birthday-app/frontend && npm install

# Zip node_modules (warning: ~300MB):
zip -r node_modules.zip node_modules/

# On the offline machine, extract node_modules/ into frontend/ and run:
npx ng serve
```

---

## Docker (easiest — all deps included automatically)

```bash
# Build and run everything with one command:
docker-compose up --build
```

See docker-compose.yml for details.
