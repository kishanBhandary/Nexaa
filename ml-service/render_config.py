"""
Production configuration for NexaModel ML Service on Render
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Production-specific imports and configurations
def configure_for_production(app: FastAPI):
    """Configure the FastAPI app for production deployment on Render"""
    
    # Update CORS for production
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "https://nexaa-frontend.onrender.com",  # Your frontend URL
            "https://nexaa-backend.onrender.com",   # Your backend URL
            "http://localhost:3000",                # Local development
            "http://localhost:5173",                # Vite dev server
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Set up production logging
    import logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    return app

# Environment-specific settings
SPRING_BOOT_AUTH_URL = os.getenv("SPRING_BOOT_AUTH_URL", "https://nexaa-backend.onrender.com")
MODEL_DIR = os.getenv("MODEL_DIR", "../nexamodel/NexaModel_Complete")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
TEMP_DIR = os.getenv("TEMP_DIR", "./temp")