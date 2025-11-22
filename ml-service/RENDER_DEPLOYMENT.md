# NexaModel ML Service - Render Deployment

This directory contains the ML service for emotion recognition, configured for deployment on Render.

## Deployment Files

- `render-requirements.txt` - Python dependencies optimized for Render
- `render-build.sh` - Build script for Render deployment
- `render-start.sh` - Start script for the service
- `render_config.py` - Production configuration

## Render Configuration

### Web Service Settings

1. **Build Command**: `./render-build.sh`
2. **Start Command**: `./render-start.sh`
3. **Environment**: `Python 3`
4. **Region**: Choose closest to your users
5. **Instance Type**: Starter (can upgrade if needed)

### Environment Variables

Set these in your Render dashboard:

```
SPRING_BOOT_AUTH_URL=https://your-backend-url.onrender.com
MODEL_DIR=../nexamodel/NexaModel_Complete
UPLOAD_DIR=./uploads
TEMP_DIR=./temp
CORS_ORIGINS=https://your-frontend-url.onrender.com,https://your-backend-url.onrender.com
JWT_SECRET_KEY=your-production-jwt-secret
LOG_LEVEL=INFO
MAX_UPLOAD_SIZE=50
MAX_AUDIO_DURATION=300
```

### Deployment Steps

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Set the root directory** to `ml-service`
4. **Configure build and start commands** as specified above
5. **Set environment variables** in the Render dashboard
6. **Deploy** - Render will automatically build and start your service

### Service Endpoints

Once deployed, your service will be available at:
- Health check: `https://your-ml-service.onrender.com/health`
- API docs: `https://your-ml-service.onrender.com/docs`
- Text analysis: `POST https://your-ml-service.onrender.com/analyze/text`
- Voice analysis: `POST https://your-ml-service.onrender.com/analyze/voice`
- Video analysis: `POST https://your-ml-service.onrender.com/analyze/video`
- Multimodal analysis: `POST https://your-ml-service.onrender.com/analyze/multimodal`

### Notes

- The service includes fallback mechanisms for when ML models are not available
- File uploads are limited to 50MB by default
- Audio duration is limited to 5 minutes by default
- The service automatically creates necessary directories on startup
- CORS is configured for production domains

### Monitoring

- Check logs in the Render dashboard for debugging
- Use the `/health` endpoint to monitor service status
- Monitor resource usage and scale as needed

## Local Testing

To test the production configuration locally:

```bash
chmod +x render-build.sh render-start.sh
./render-build.sh
./render-start.sh
```