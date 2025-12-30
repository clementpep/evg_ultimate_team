# 🚀 Deployment Guide - Hugging Face Spaces

This guide explains how to deploy **EVG Ultimate Team** on Hugging Face Spaces using Docker.

## 📋 Prerequisites

- A [Hugging Face](https://huggingface.co/) account
- Git installed on your local machine
- The project ready for deployment (all tasks completed)

## 🏗️ Deployment Architecture

The application is deployed as a **single Docker container** containing:
- **Frontend**: React app (built with Vite) served as static files
- **Backend**: FastAPI server that serves both the API and the frontend
- **Database**: SQLite (stored in `/app/data` volume)

**Port**: 7860 (Hugging Face Spaces default)

## 📝 Step-by-Step Deployment

### 1. Create a New Space

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces)
2. Click **"Create new Space"**
3. Configure your Space:
   - **Space name**: `evg-ultimate-team` (or your choice)
   - **License**: MIT
   - **Select SDK**: **Docker**
   - **Visibility**: Private (recommended for personal use)
4. Click **"Create Space"**

### 2. Clone Your Space Repository

```bash
# Clone the empty Space repository
git clone https://huggingface.co/spaces/YOUR_USERNAME/evg-ultimate-team
cd evg-ultimate-team
```

### 3. Copy Project Files

Copy all project files to your Space directory:

```bash
# From your local project directory
cp -r * /path/to/evg-ultimate-team/
cp .dockerignore /path/to/evg-ultimate-team/
cp .gitignore /path/to/evg-ultimate-team/
```

**Important files for deployment:**
- `Dockerfile` - Multi-stage Docker build
- `.dockerignore` - Excludes unnecessary files
- `README.md` - With Hugging Face header (YAML front matter)
- `backend/` - FastAPI application
- `frontend/` - React application source

### 4. Commit and Push

```bash
cd /path/to/evg-ultimate-team

# Add all files
git add .

# Commit
git commit -m "Initial deployment of EVG Ultimate Team"

# Push to Hugging Face
git push
```

### 5. Wait for Build

Hugging Face will automatically:
1. Detect the `Dockerfile`
2. Build the Docker image (may take 5-10 minutes)
3. Deploy the container
4. Start the application on port 7860

You can monitor the build progress in the Space's "Logs" tab.

### 6. Access Your Application

Once deployed, your app will be available at:
```
https://YOUR_USERNAME-evg-ultimate-team.hf.space
```

## 🔧 Configuration

### Environment Variables (Optional)

You can set environment variables in Hugging Face Spaces settings:

- `SECRET_KEY` - Secret key for session management (auto-generated if not set)
- `ADMIN_USERNAME` - Admin username (default: `clement`)
- `ADMIN_PASSWORD` - Admin password (default: `evg2026_admin`)
- `CORS_ORIGINS` - CORS allowed origins (default: `*`)
- `DEBUG` - Debug mode (default: `false`)

**To set variables:**
1. Go to your Space's **Settings**
2. Scroll to **Repository secrets**
3. Add your variables

### Database Persistence

⚠️ **Important**: SQLite data is stored in `/app/data/` inside the container.

**Data will be lost when the Space restarts** unless you:
- Use Hugging Face persistent storage (if available)
- Backup the database manually
- Consider using an external PostgreSQL database for production

## 🧪 Testing Your Deployment

1. **Health Check**: Visit `https://YOUR_USERNAME-evg-ultimate-team.hf.space/health`
   - Should return: `{"success": true, "status": "healthy"}`

2. **API Check**: Visit `https://YOUR_USERNAME-evg-ultimate-team.hf.space/api`
   - Should return API information

3. **Frontend**: Visit `https://YOUR_USERNAME-evg-ultimate-team.hf.space/`
   - Should display the EVG Ultimate Team homepage

4. **Login**: Try logging in with:
   - Participants: Any username from the seeded list (no password)
   - Admin: `clement` / `evg2026_admin`

## 🔄 Updating Your Deployment

To update your deployed application:

```bash
# Make changes to your code
# ...

# Commit changes
git add .
git commit -m "Update: description of changes"

# Push to Hugging Face
git push
```

Hugging Face will automatically rebuild and redeploy.

## 📊 Monitoring

### Logs

View application logs in real-time:
1. Go to your Space on Hugging Face
2. Click the **"Logs"** tab
3. Monitor startup, requests, and errors

### Health Check

The application includes a health check endpoint:
- Endpoint: `/health`
- Interval: Every 30 seconds
- Timeout: 10 seconds

## 🐛 Troubleshooting

### Build Fails

1. Check the build logs in the "Logs" tab
2. Common issues:
   - Missing dependencies in `requirements.txt` or `package.json`
   - Frontend build errors (check TypeScript/Vite errors)
   - Docker syntax errors

### Application Won't Start

1. Check that port 7860 is exposed in `Dockerfile`
2. Verify environment variables are set correctly
3. Check logs for Python/FastAPI errors

### Frontend Not Loading

1. Ensure frontend was built correctly:
   - Check that `frontend/dist` exists in the container
   - Verify static files are being served from `/assets`

2. Check browser console for errors:
   - API connection issues
   - CORS errors (should be allowed with `CORS_ORIGINS=*`)

### Database Issues

1. Database file should be created automatically on first run
2. Location: `/app/data/evg_ultimate_team.db`
3. Check write permissions in logs

## 🔒 Security Recommendations

For production use:

1. **Change Default Credentials**:
   - Set strong `ADMIN_PASSWORD` via environment variables

2. **CORS Configuration**:
   - In production, replace `CORS_ORIGINS=*` with your specific domain
   - Example: `CORS_ORIGINS=https://YOUR_USERNAME-evg-ultimate-team.hf.space`

3. **Secret Key**:
   - Set a strong `SECRET_KEY` environment variable

4. **Make Space Private**:
   - If this is for a private bachelor party, keep the Space private
   - Invite only authorized users

## 📚 Additional Resources

- [Hugging Face Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- [Docker SDK for Spaces](https://huggingface.co/docs/hub/spaces-sdks-docker)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Vite Documentation](https://vitejs.dev/)

## 💡 Tips

- **Development**: Test the Docker build locally before pushing:
  ```bash
  docker build -t evg-ultimate-team .
  docker run -p 7860:7860 evg-ultimate-team
  ```

- **Logs**: Use `docker logs` locally to debug issues before deployment

- **Database Backup**: Manually backup the SQLite database if needed:
  ```bash
  # From inside the container
  cp /app/data/evg_ultimate_team.db /app/data/backup_$(date +%Y%m%d).db
  ```

---

🎉 **You're all set!** Your EVG Ultimate Team app should now be live on Hugging Face Spaces!
