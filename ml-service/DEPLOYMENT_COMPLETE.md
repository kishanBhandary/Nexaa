# NexaModel ML Service - Complete Render Deployment Guide

## 📋 Overview

This guide provides complete instructions for deploying the NexaModel ML Service to Render. The service provides emotion recognition capabilities through multiple endpoints.

## 📁 Deployment Files Created

### Core Deployment Files
- `render-requirements.txt` - Optimized Python dependencies for Render
- `render-build.sh` - Build script that installs system dependencies and sets up the environment
- `render-start.sh` - Start script that launches the FastAPI service
- `Dockerfile` - Container configuration for Docker-based deployment
- `render.yaml` - Infrastructure as Code configuration for Render
- `setup_fallback_models.py` - Creates mock models when actual models aren't available

### Configuration Files
- `render_config.py` - Production-specific configuration
- `healthcheck.py` - Health monitoring script
- `RENDER_DEPLOYMENT.md` - Detailed deployment documentation

## 🚀 Deployment Steps

### Option 1: Using Render Dashboard (Recommended)

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```
   Name: nexaa-ml-service
   Environment: Python 3
   Region: Oregon (or closest to your users)
   Branch: main
   Root Directory: ml-service
   ```

3. **Build & Start Commands**
   ```
   Build Command: ./render-build.sh
   Start Command: ./render-start.sh
   ```

4. **Environment Variables**
   Set these in the Render dashboard:
   ```
   SPRING_BOOT_AUTH_URL=https://nexaa-backend.onrender.com
   MODEL_DIR=../nexamodel/NexaModel_Complete
   UPLOAD_DIR=./uploads
   TEMP_DIR=./temp
   CORS_ORIGINS=https://your-frontend.onrender.com,https://your-backend.onrender.com
   LOG_LEVEL=INFO
   MAX_UPLOAD_SIZE=50
   MAX_AUDIO_DURATION=300
   JWT_SECRET_KEY=your-secure-jwt-secret
   TTS_LANGUAGE=en
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your service

### Option 2: Using render.yaml (Infrastructure as Code)

1. **Update URLs in render.yaml**
   ```yaml
   # Edit ml-service/render.yaml and update:
   - SPRING_BOOT_AUTH_URL: https://your-backend.onrender.com
   - CORS_ORIGINS: https://your-frontend.onrender.com,https://your-backend.onrender.com
   ```

2. **Deploy via Render Dashboard**
   - Connect repository
   - Render will automatically detect and use render.yaml

## 📊 Service Endpoints

Once deployed, your ML service will be available at:

### Health & Info
- `GET /` - Service information
- `GET /health` - Health status
- `GET /docs` - Interactive API documentation
- `GET /model/info` - Model information

### Emotion Analysis
- `POST /analyze/text` - Text emotion analysis
- `POST /analyze/voice` - Audio file emotion analysis  
- `POST /analyze/video` - Video/image emotion analysis
- `POST /analyze/multimodal` - Combined analysis

### Audio Responses
- `GET /audio/{filename}` - Generated TTS audio files

## 🔧 Configuration Details

### System Dependencies
The service requires these system packages (automatically installed):
- ffmpeg (audio processing)
- libsndfile1 (audio file support)
- OpenGL libraries (image processing)
- Various system libraries for OpenCV

### Python Dependencies
Key packages include:
- FastAPI + Uvicorn (web framework)
- OpenCV (computer vision)
- librosa (audio processing)
- scikit-learn (machine learning)
- gtts (text-to-speech)
- python-jose (JWT authentication)

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8001 | Service port (set by Render) |
| `SPRING_BOOT_AUTH_URL` | localhost:8080 | Backend auth service URL |
| `MODEL_DIR` | ../nexamodel/NexaModel_Complete | ML models directory |
| `CORS_ORIGINS` | localhost URLs | Allowed CORS origins |
| `LOG_LEVEL` | INFO | Logging level |
| `MAX_UPLOAD_SIZE` | 50 | Max file size (MB) |
| `MAX_AUDIO_DURATION` | 300 | Max audio length (seconds) |

## 🔍 Monitoring & Debugging

### Health Checks
```bash
# Check service health
curl https://your-ml-service.onrender.com/health

# Test with healthcheck script
python healthcheck.py
```

### Logs
- View logs in Render dashboard
- Monitor /health endpoint
- Check /docs for API testing

### Common Issues

1. **Build Failures**
   - Check system dependencies installation
   - Verify Python requirements
   - Ensure scripts are executable

2. **Runtime Errors**
   - Check environment variables
   - Verify CORS configuration
   - Test endpoints individually

3. **Model Loading Issues**
   - Service includes fallback mechanisms
   - Check model directory permissions
   - Verify model files exist

## 🔄 Integration with Backend

Update your backend service environment variables:
```
ML_SERVICE_URL=https://your-ml-service.onrender.com
ML_SERVICE_ENABLED=true
ML_SERVICE_TIMEOUT=30000
```

## 📈 Scaling Considerations

### Instance Types
- **Starter**: Good for development and light usage
- **Standard**: Better performance, more memory
- **Pro**: High performance, recommended for production

### Performance Tips
- Use closest region to your users
- Monitor resource usage in Render dashboard
- Consider upgrading instance type if needed
- Implement proper error handling and retries

## 🛡️ Security

- JWT token validation with backend service
- CORS properly configured for production domains
- File upload limits enforced
- Secure environment variable handling

## ✅ Testing Deployment

1. **Health Check**
   ```bash
   curl https://your-ml-service.onrender.com/health
   ```

2. **API Documentation**
   Visit: `https://your-ml-service.onrender.com/docs`

3. **Test Analysis**
   ```bash
   curl -X POST "https://your-ml-service.onrender.com/analyze/text" \
        -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"text": "I am feeling great today!"}'
   ```

## 📞 Support

- Check Render logs for detailed error messages
- Use `/health` endpoint for service monitoring
- Test endpoints with `/docs` interactive documentation
- Monitor resource usage in Render dashboard

Your NexaModel ML Service is now ready for deployment on Render! 🎉