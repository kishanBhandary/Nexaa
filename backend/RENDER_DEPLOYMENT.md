# Deploying Nexaa Backend to Render (Docker)

This guide shows how to deploy the Spring Boot backend using the existing pre-built JAR and the provided `Dockerfile`.

## 1. Prerequisites
- GitHub repository connected to Render.
- The JAR file present at `backend/target/nexaa-backend-1.0.0.jar`.
- `backend/Dockerfile` committed.

If you obtain source code later, you can re-enable the build stage in the Dockerfile.

## 2. Create the Web Service in Render
1. In Render dashboard click: New > Web Service.
2. Choose your repository.
3. Set the following:
   - Name: `nexaa-backend` (or preferred)
   - Runtime / Language: `Docker`
   - Branch: `main`
   - Root Directory: `backend` (IMPORTANT: ensures the Docker build context is the backend folder only)
   - Region: choose closest to users.
4. Click **Advanced** (optional) and configure Auto Deploy: On.

Render auto-detects the Dockerfile and runs `docker build` automatically.

## 3. Environment Variables (Security & Overrides)
Spring Boot will map environment variables to property names automatically.
Add these in the Render dashboard under Environment:

| Env Var | Maps To | Purpose |
|---------|---------|---------|
| `PORT` | `server.port` | Render auto-sets this. Do not change. |
| `SPRING_DATA_MONGODB_URI` | `spring.data.mongodb.uri` | Secure MongoDB connection string (remove hard-coded one). |
| `SPRING_DATA_MONGODB_DATABASE` | `spring.data.mongodb.database` | Database name if not part of URI. |
| `JWT_SECRET` | `jwt.secret` | Secret key for signing tokens (long, random). |
| `SPRING_PROFILES_ACTIVE` | `spring.profiles.active` | e.g. `prod` or `docker`. |
| `LOG_LEVEL_ROOT` | `logging.level.root` | Adjust logging (optional). |

Remove hard-coded secrets from the repository when you have source & can rebuild the JAR. For now, environment variables will override the values packaged in `application.properties`.

## 4. Health Check Endpoint
The Dockerfile defines:
```
HEALTHCHECK ... CMD curl -f http://127.0.0.1:${PORT:-8080}/api/health || exit 1
```
Change `/api/health` to a valid endpoint your application exposes. If you do not have one yet, either:
- Implement a simple `GET /api/health` controller returning 200 OK, OR
- Comment out the HEALTHCHECK line in the Dockerfile.

Without a valid endpoint, the container will continually restart.

## 5. Logs
Render aggregates container stdout/stderr. The JVM GC logs were removed for simplicity. If you need more diagnostics set:
```
JAVA_OPTS=-Xms256m -Xmx512m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dlogging.level.com.nexaa=INFO
```

## 6. Deploy
Click "Deploy Web Service". The steps:
1. Render builds the image with `backend` as context.
2. Container starts with command: `java $JAVA_OPTS -jar app.jar`.
3. App binds to `$PORT` via `server.port=${PORT:8080}` property.

## 7. Verify
- Visit the Render dashboard service URL (e.g. https://nexaa-backend.onrender.com/api/...)
- Check Logs tab for startup messages.
- Confirm health (Status: Healthy) if health check endpoint configured.

## 8. Future Improvements
- Commit source (`src/main/java/...`) and `pom.xml`; switch back to multi-stage build for reproducibility.
- Replace hard-coded secrets from the JAR by rebuilding after editing `application.properties`.
- Add metrics / actuator by including `spring-boot-starter-actuator` then use `/actuator/health`.
- Implement structured logging (JSON) for easier log parsing.

## 9. Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| Crash: "JAR not found" | JAR missing from target path | Ensure it exists & commit or rebuild with Maven. |
| Healthcheck failing | Endpoint not present | Update path or comment out healthcheck. |
| 502 Bad Gateway | App not listening on PORT | Ensure `server.port=${PORT:8080}` remains in `application.properties`. |
| Mongo auth errors | Wrong URI or IP whitelist | Verify Atlas network access & credentials. |

## 10. Local Docker Test
From repo root:
```bash
cd backend
docker build -t nexaa-backend:local .
docker run --rm -e PORT=8080 -p 8080:8080 nexaa-backend:local
```
Visit http://localhost:8080/api/...

---
**Done.** Deploy confidently!
