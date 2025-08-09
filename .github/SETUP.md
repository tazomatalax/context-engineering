# GitHub Actions Setup

## NPM Auto-Publishing Setup

To enable auto-publishing to NPM when you commit to main:

### 1. Create NPM Access Token

1. Go to [npmjs.com](https://npmjs.com) and log in
2. Click your profile → "Access Tokens" 
3. Generate new token → **Automation** (for CI/CD)
4. Copy the token (starts with `npm_...`)

### 2. Add Token to GitHub Secrets

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: Paste your NPM token
5. Click "Add secret"

### 3. How It Works

- **Triggers**: Only when you push to `main` branch AND change files in `installer/`
- **Version Check**: Compares `package.json` version with published NPM version
- **Auto-Publish**: Only publishes if version number changed
- **GitHub Release**: Creates a release tag automatically

### 4. Publishing Flow

```bash
# 1. Update version in installer/package.json
cd installer
npm version patch  # or minor/major

# 2. Commit and push to main
git add .
git commit -m "Release v1.2.3"
git push origin main

# 3. GitHub Actions automatically publishes to NPM
```

### 5. Manual Override

If you need to publish manually:

```bash
cd installer
npm login
npm publish
```

## Security Notes

- The `NPM_TOKEN` has automation scope (limited permissions)
- Workflow only runs on main branch
- Version must be incremented to trigger publish
- All secrets are encrypted in GitHub