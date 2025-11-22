#!/usr/bin/env python3
"""
Health check script for NexaModel ML Service
"""

import requests
import sys
import os

def check_health():
    """Check if the ML service is healthy"""
    try:
        # Get the service URL from environment or use default
        service_url = os.getenv('SERVICE_URL', 'http://localhost:8001')
        
        # Check health endpoint
        response = requests.get(f"{service_url}/health", timeout=10)
        
        if response.status_code == 200:
            health_data = response.json()
            print(f"✓ Service is {health_data.get('status', 'unknown')}")
            print(f"  Message: {health_data.get('message', 'N/A')}")
            print(f"  Model loaded: {health_data.get('model_loaded', False)}")
            return True
        else:
            print(f"✗ Health check failed with status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to service")
        return False
    except requests.exceptions.Timeout:
        print("✗ Health check timed out")
        return False
    except Exception as e:
        print(f"✗ Health check error: {e}")
        return False

def check_endpoints():
    """Check if key endpoints are responding"""
    service_url = os.getenv('SERVICE_URL', 'http://localhost:8001')
    
    endpoints = [
        '/',
        '/docs',
        '/model/info'
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{service_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"✓ {endpoint} is accessible")
            else:
                print(f"✗ {endpoint} returned status {response.status_code}")
        except Exception as e:
            print(f"✗ {endpoint} error: {e}")

if __name__ == "__main__":
    print("NexaModel ML Service Health Check")
    print("=" * 40)
    
    if check_health():
        print("\nChecking endpoints...")
        check_endpoints()
        print("\n✓ Service appears to be running correctly")
        sys.exit(0)
    else:
        print("\n✗ Service health check failed")
        sys.exit(1)