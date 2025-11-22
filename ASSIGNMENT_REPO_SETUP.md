# Assignment Repository Setup Guide

## Repository Name
**`COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application`**

## Step-by-Step Instructions

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. **Repository name**: `COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application`
3. **Description**: "COS30049 Assignment 3 - Full-Stack Web Development for AI Application: Air Quality and Health Monitoring System"
4. **Visibility**: 
   - Choose **Public** (if allowed by your institution)
   - Or **Private** (if required)
5. **Important**: 
   - ❌ **DO NOT** check "Add a README file"
   - ❌ **DO NOT** check "Add .gitignore"
   - ❌ **DO NOT** check "Choose a license"
   - (We already have these files)
6. Click **"Create repository"**

### Step 2: Upload Your Code

After creating the repository, GitHub will show you instructions. Use these commands:

```bash
# Navigate to your project folder
cd "Air Quality and Health"

# Initialize git (if not already done)
git init

# Add all files (this respects .gitignore - won't add node_modules, venv, etc.)
git add .

# Check what will be uploaded (verify no sensitive files)
git status

# Commit
git commit -m "Initial commit: COS30049 Assignment 3 - Air Quality and Health Application"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 3: Verify Upload

1. Go to your repository on GitHub
2. Verify you can see:
   - ✅ `README.md` (main project README)
   - ✅ `backend/` folder with all source code
   - ✅ `frontend/` folder with all source code
   - ✅ `.gitignore` file
   - ❌ Should NOT see `node_modules/` or `venv/` folders

### Step 4: Add Repository Description (Optional)

1. Go to your repository on GitHub
2. Click the gear icon ⚙️ next to "About"
3. Add description: "COS30049 Assignment 3 - Full-Stack Web Development for AI Application"
4. Add topics: `cos30049`, `assignment3`, `react`, `fastapi`, `machine-learning`, `air-quality`, `full-stack`, `xgboost`

## Quick Command Reference

```bash
# Full upload sequence (copy-paste ready)
cd "Air Quality and Health"
git init
git add .
git commit -m "Initial commit: COS30049 Assignment 3 - Air Quality and Health Application"
git remote add origin https://github.com/YOUR_USERNAME/COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application.git
git branch -M main
git push -u origin main
```

**Remember to replace `YOUR_USERNAME` with your actual GitHub username!**

## Troubleshooting

### If you get "repository already exists" error:
- You already created the repo on GitHub - that's fine!
- Just skip the `git remote add` step if you already added it
- Or use: `git remote set-url origin https://github.com/YOUR_USERNAME/COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application.git`

### If you get authentication errors:
- Use GitHub Personal Access Token instead of password
- Or set up SSH keys
- Or use GitHub Desktop app

### If files are too large:
- Check `ML/data/Final.csv` size
- If >100MB, consider using Git LFS or excluding it

## Repository URL Format

Your repository URL will be:
```
https://github.com/YOUR_USERNAME/COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application
```

## What Gets Uploaded

✅ **Included:**
- All source code (`.py`, `.tsx`, `.ts`, `.js`)
- Configuration files (`package.json`, `requirements.txt`)
- Documentation (`README.md` files)
- Data files (if not too large)
- Scripts (`start.sh`)

❌ **Excluded (by .gitignore):**
- `node_modules/` - Dependencies
- `venv/` - Python virtual environment
- `__pycache__/` - Python cache
- `dist/` - Build outputs
- `.env` - Environment variables

---

**Ready?** Follow the steps above and your assignment will be uploaded to GitHub! 🚀

