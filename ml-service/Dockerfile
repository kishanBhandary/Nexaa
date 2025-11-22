# Dockerfile for NexaModel ML Service on Render
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libfontconfig1 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY render-requirements.txt .
RUN pip install --no-cache-dir -r render-requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads temp logs ../nexamodel/NexaModel_Complete

# Set permissions
RUN chmod 755 uploads temp logs

# Create mock model files for fallback
COPY setup_fallback_models.py .
RUN python setup_fallback_models.py

# Expose port
EXPOSE 8001

# Start command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]