# 🔐 Environment Variables Security Guide

## ⚠️ CRITICAL: Protecting Your API Keys

Your `.env` files contain sensitive API keys that should **NEVER** be pushed to GitHub or any public repository.

## 🛡️ What We've Set Up

### 1. **.gitignore Protection**
- ✅ `.env` files are ignored by Git
- ✅ Only `.env.example` templates are tracked
- ✅ Upload and temp directories are protected

### 2. **Environment Structure**
```
project/
├── .env.example          ← Safe template (committed)
├── .env                  ← Real keys (NOT committed)
├── ml-service/
│   ├── .env.example      ← Safe template
│   └── .env              ← Real keys (NOT committed)
├── frontend/
│   ├── .env.example      ← Safe template  
│   └── .env              ← Real keys (NOT committed)
└── backend/
    ├── .env.example      ← Safe template
    └── .env              ← Real keys (NOT committed)
```

## 🚀 Quick Setup

### For New Team Members:
```bash
# 1. Clone the repository
git clone https://github.com/your-username/nexaa.git
cd nexaa

# 2. Run setup script
./setup_env.sh

# 3. Add your API keys to the .env files
# Edit ml-service/.env and add your Gemini API key
```

### For Existing Project:
```bash
# Run the setup script
./setup_env.sh
```

## 🔑 Required API Keys

### 1. **Gemini AI API Key** (Required)
- **Service**: `ml-service/.env`
- **Variable**: `GEMINI_API_KEY`
- **Get it**: https://makersuite.google.com/app/apikey
- **Free tier**: Available with rate limits

### 2. **Google OAuth** (Optional)
- **Service**: `frontend/.env` & `backend/.env`
- **Variables**: `VITE_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Get it**: https://console.developers.google.com/

### 3. **GitHub OAuth** (Optional)
- **Service**: `frontend/.env` & `backend/.env` 
- **Variables**: `VITE_GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- **Get it**: https://github.com/settings/developers

## 🆘 Emergency: If API Keys Were Exposed

### If you accidentally pushed `.env` files to GitHub:

1. **Immediately regenerate ALL API keys**:
   - Gemini: https://makersuite.google.com/app/apikey
   - Google OAuth: https://console.developers.google.com/
   - GitHub OAuth: https://github.com/settings/developers

2. **Remove files from Git tracking**:
   ```bash
   git rm --cached ml-service/.env frontend/.env backend/.env
   git commit -m "Remove environment files from tracking"
   git push
   ```

3. **Update your new keys**:
   ```bash
   ./setup_env.sh
   ```

## 🌐 Production Deployment

### For Production Environments:

1. **Never use .env files in production**
2. **Use platform environment variables**:

#### Vercel (Frontend):
```bash
vercel env add VITE_BACKEND_URL
vercel env add VITE_ML_SERVICE_URL
```

#### Railway/Render (Backend):
- Add environment variables in dashboard
- Use secrets management

#### Docker:
```bash
docker run -e GEMINI_API_KEY="your-key" your-app
```

## ✅ Security Checklist

- [ ] `.env` files are in `.gitignore`
- [ ] Only `.env.example` files are committed
- [ ] Real API keys are not in Git history
- [ ] Team members know to use `setup_env.sh`
- [ ] Production uses platform environment variables
- [ ] API keys have appropriate rate limits/restrictions

## 🔍 Verify Security

```bash
# Check what's being tracked by Git
git ls-files | grep -E "\.env$"
# Should return nothing (only .env.example should be tracked)

# Check .gitignore is working
git status
# .env files should not appear in untracked files
```

## 📞 Need Help?

- **Environment Setup**: Run `./setup_env.sh`
- **API Key Issues**: Check the service documentation links above
- **Git Issues**: Use the emergency steps above

---

**Remember**: When in doubt, regenerate your API keys! It's better to be safe than sorry. 🔒