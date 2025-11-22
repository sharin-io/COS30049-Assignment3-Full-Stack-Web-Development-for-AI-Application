# Quick GitHub Upload Checklist

## ✅ What to Upload

### Include These:
- ✅ All source code (`src/`, `*.py`, `*.tsx`, `*.ts`, `*.js`)
- ✅ Configuration files (`package.json`, `requirements.txt`, `*.config.*`)
- ✅ Documentation (`README.md`, `*.md` files)
- ✅ Data files (`ML/data/Final.csv` - if not too large)
- ✅ Scripts (`start.sh`)
- ✅ Lock files (`package-lock.json`)

### Exclude These (Auto-ignored):
- ❌ `node_modules/` - Dependencies (will be installed via `npm install`)
- ❌ `venv/` - Python virtual environment (users create their own)
- ❌ `__pycache__/` - Python cache
- ❌ `dist/` - Build outputs
- ❌ `.env` - Environment variables with secrets
- ❌ `.DS_Store` - System files

## 🚀 Quick Upload Steps

```bash
# 1. Navigate to project
cd "Air Quality and Health"

# 2. Check what will be uploaded
git status

# 3. Add all files (respects .gitignore)
git add .

# 4. Commit
git commit -m "Initial commit: Air Quality and Health Application"

# 5. Create repo on GitHub first:
#    - Go to https://github.com/new
#    - Name: COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application
#    - DO NOT initialize with README (we already have one)
#    - Then run:
git remote add origin https://github.com/YOUR_USERNAME/COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application.git
git branch -M main
git push -u origin main
```

## ⚠️ Before Uploading

1. **Check for secrets**: Remove any API keys/tokens from code
2. **Check file sizes**: Large files (>100MB) may need Git LFS
3. **Verify .gitignore**: Run `git status` - should NOT show node_modules, venv

## 📋 Repository Should Include

```
✅ README.md
✅ backend/ (source code, configs, docs)
✅ frontend/ (source code, configs, docs)
✅ .gitignore
✅ Documentation files (*.md)
```

---

**For detailed guide, see `GITHUB_UPLOAD_GUIDE.md`**

