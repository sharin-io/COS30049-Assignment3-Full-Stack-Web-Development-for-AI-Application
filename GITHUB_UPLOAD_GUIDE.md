# GitHub Upload Guide

This guide explains what files and folders to upload to GitHub for the Air Quality and Health application.

## ✅ Files/Folders TO Upload (Include)

### Root Directory
- ✅ `README.md` - Main project documentation
- ✅ `QUICKSTART.md` - Quick start guide
- ✅ `SETUP_COMPLETE.md` - Setup completion notes
- ✅ `SETUP_SUMMARY.md` - Setup summary
- ✅ `.gitignore` - Git ignore rules

### Backend Directory (`backend/`)
- ✅ `main.py` - FastAPI application
- ✅ `server.js` - Express API gateway
- ✅ `package.json` - Node.js dependencies
- ✅ `package-lock.json` - Node.js lock file
- ✅ `requirements.txt` - Python dependencies
- ✅ `start.sh` - Startup script
- ✅ `README.md` - Backend API documentation
- ✅ `ML/` directory:
  - ✅ `ML/data/Final.csv` - Historical dataset (if not too large, otherwise use Git LFS)
  - ✅ `ML/ML_model/XGBRegressor.py` - XGBoost model
  - ✅ `ML/ML_model/ClassificationModels.py` - Classification models
  - ✅ `ML/ML_model/ClusteringModel.py` - Clustering models
  - ✅ `ML/ML-result/` - ML results (optional, can be regenerated)

### Frontend Directory (`frontend/`)
- ✅ `package.json` - Dependencies
- ✅ `package-lock.json` - Lock file
- ✅ `README.md` - Frontend documentation
- ✅ `vite.config.ts` - Vite configuration
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `tsconfig.app.json` - TypeScript app config
- ✅ `tsconfig.node.json` - TypeScript node config
- ✅ `tailwind.config.js` - Tailwind CSS configuration
- ✅ `postcss.config.js` - PostCSS configuration
- ✅ `eslint.config.js` - ESLint configuration
- ✅ `components.json` - Component configuration
- ✅ `index.html` - HTML entry point
- ✅ `.gitignore` - Frontend git ignore rules
- ✅ `src/` - All source code:
  - ✅ `src/App.tsx`
  - ✅ `src/main.tsx`
  - ✅ `src/index.css`
  - ✅ `src/pages/` - All page components
  - ✅ `src/components/` - All components
  - ✅ `src/lib/` - API clients and utilities
  - ✅ `src/hooks/` - React hooks
  - ✅ `src/types/` - TypeScript types
  - ✅ `src/utils/` - Utility functions
  - ✅ `src/api/` - API functions
- ✅ `public/` - Public assets:
  - ✅ `public/geo/` - GeoJSON files

## ❌ Files/Folders NOT to Upload (Excluded by .gitignore)

### Node Modules (Auto-excluded)
- ❌ `backend/node_modules/` - Node.js dependencies
- ❌ `frontend/node_modules/` - Node.js dependencies

### Python Virtual Environment (Auto-excluded)
- ❌ `backend/venv/` - Python virtual environment
- ❌ `backend/__pycache__/` - Python cache files
- ❌ `backend/ML/ML_model/__pycache__/` - Python cache

### Build/Distribution Files (Auto-excluded)
- ❌ `frontend/dist/` - Production build output
- ❌ `frontend/dist-ssr/` - SSR build output

### System Files (Auto-excluded)
- ❌ `.DS_Store` - macOS system files
- ❌ `*.log` - Log files
- ❌ `.env` - Environment variables (if contains secrets)

### IDE/Editor Files (Optional - can include if team uses same IDE)
- ❌ `.vscode/` - VS Code settings (usually excluded)
- ❌ `.idea/` - IntelliJ/WebStorm settings

## 📋 Pre-Upload Checklist

Before uploading to GitHub, ensure:

1. ✅ **No sensitive data**: Remove any API keys, tokens, or passwords
   - Check `backend/server.js` - WAQI token should use environment variable
   - Check for any `.env` files with secrets

2. ✅ **Large files**: If `Final.csv` is very large (>100MB), consider:
   - Using Git LFS (Large File Storage)
   - Or excluding it and documenting where to get it

3. ✅ **Documentation**: All README files are up to date
   - Main `README.md`
   - `backend/README.md`
   - `frontend/README.md`

4. ✅ **.gitignore is working**: Test that excluded files are not tracked
   ```bash
   git status
   # Should NOT show node_modules, venv, etc.
   ```

5. ✅ **Startup scripts are executable**:
   ```bash
   chmod +x backend/start.sh
   ```

## 🚀 Upload Steps

### Step 1: Create Repository on GitHub First

1. Go to https://github.com/new
2. Repository name: `COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application`
3. Description: "Full-Stack Web Development for AI Application - Air Quality and Health Monitoring System"
4. Set to **Public** (or Private if required by your institution)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Step 2: Upload Code Using Git Command Line

```bash
# Navigate to project root
cd "Air Quality and Health"

# Initialize git (if not already done)
git init

# Add all files (respects .gitignore)
git add .

# Check what will be committed
git status

# Commit
git commit -m "Initial commit: COS30049 Assignment 3 - Air Quality and Health Application"

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option 2: Using GitHub Desktop

1. Open GitHub Desktop
2. File → Add Local Repository
3. Select the project folder
4. Review changes (should NOT include node_modules, venv, etc.)
5. Write commit message
6. Commit to main
7. Publish repository to GitHub

### Option 3: Using VS Code

1. Open project in VS Code
2. Source Control panel (Ctrl+Shift+G)
3. Stage all changes
4. Commit with message
5. Publish to GitHub

## 📦 Recommended Repository Structure

Your GitHub repository should be named: **`COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application`**

The repository structure should look like this:

```
COS30049-Assignment3-Full-Stack-Web-Development-for-AI-Application/
├── .gitignore
├── README.md
├── QUICKSTART.md
├── SETUP_COMPLETE.md
├── SETUP_SUMMARY.md
├── backend/
│   ├── .gitignore (if separate)
│   ├── README.md
│   ├── main.py
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── requirements.txt
│   ├── start.sh
│   └── ML/
│       ├── data/
│       │   └── Final.csv
│       ├── ML_model/
│       │   ├── XGBRegressor.py
│       │   ├── ClassificationModels.py
│       │   └── ClusteringModel.py
│       └── ML-result/
└── frontend/
    ├── .gitignore
    ├── README.md
    ├── package.json
    ├── package-lock.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── index.html
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── pages/
    │   ├── components/
    │   ├── lib/
    │   ├── hooks/
    │   ├── types/
    │   └── utils/
    └── public/
        └── geo/
```

## ⚠️ Important Notes

1. **Large CSV File**: If `ML/data/Final.csv` is very large:
   ```bash
   # Option 1: Use Git LFS
   git lfs install
   git lfs track "*.csv"
   git add .gitattributes
   git add ML/data/Final.csv
   
   # Option 2: Exclude and document
   # Add to .gitignore: ML/data/Final.csv
   # Document in README where to get the file
   ```

2. **Environment Variables**: Create a `.env.example` file:
   ```bash
   # backend/.env.example
   WAQI_TOKEN=your_token_here
   ```
   Then add `.env` to `.gitignore` (already done)

3. **Package Lock Files**: ✅ **DO include** `package-lock.json` files - they ensure consistent dependency versions

4. **Python Virtual Environment**: ❌ **DO NOT include** `venv/` - users will create their own

## 🔍 Verify Before Upload

Run these commands to verify:

```bash
# Check what will be uploaded
git status

# Check file sizes (should not have huge files)
find . -type f -size +10M -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./venv/*"

# Verify .gitignore is working
git check-ignore -v node_modules/
git check-ignore -v venv/
```

## 📝 After Upload

1. ✅ Add repository description on GitHub
2. ✅ Add topics/tags (e.g., `react`, `fastapi`, `machine-learning`, `air-quality`)
3. ✅ Update README with repository-specific links
4. ✅ Consider adding a LICENSE file
5. ✅ Set up branch protection (optional)

---

**Ready to upload?** Follow the steps above and your repository will be properly organized and ready for others to clone and run!

