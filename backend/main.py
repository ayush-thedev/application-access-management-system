from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routes import auth, applications, requests, user_roles, users, notifications, settings, roles, audit
from database import connection_pool
import os

app = FastAPI(
    title="Identity Governance API",
    description="Application Access Management System API",
    version="1.0.0"
)


@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(requests.router, prefix="/api")
app.include_router(user_roles.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(roles.router, prefix="/api")
app.include_router(audit.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Identity Governance API", "status": "running"}


@app.get("/health")
def health_check():
    try:
        conn = connection_pool.get_connection()
        conn.ping()
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
