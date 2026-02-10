# New GitHub Repository Setup – Action Plan

## Current state
- **Current remote:** `origin` → `keshvari/image-report-from-video`
- **Current branch:** `rectosigmoidoscopy-feature`
- **Uncommitted changes:** Modified and untracked files (e.g. `package.json`, `src/`, `public/`, etc.)

---

## Steps to use a new GitHub repository

### Step 1: Remove the old remote
Remove the existing `origin` so you can point to your new repo.

```bash
git remote remove origin
```

### Step 2: Create the new repository on GitHub
1. Go to https://github.com/new  
2. Choose a name (e.g. `electron-screen-recorder` or your preferred name).  
3. Do **not** initialize with a README, .gitignore, or license (you already have a project).  
4. Click **Create repository**.

### Step 3: Add the new remote
Replace `YOUR_USERNAME` and `YOUR_NEW_REPO_NAME` with your GitHub username and new repo name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_NEW_REPO_NAME.git
```

If you use SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_NEW_REPO_NAME.git
```

### Step 4: Commit your current work (if you want it in the new repo)
If you want your current changes in the first push:

```bash
git add .
git status   # review what will be committed
git commit -m "Initial commit for new project"
```

### Step 5: Push to the new repository
Push your current branch and set upstream:

```bash
git push -u origin rectosigmoidoscopy-feature
```

To push `master` as well:

```bash
git push -u origin master
```

---

## Optional: Start with a clean history
If you want the new repo to have a single “fresh” commit (no history from the old repo):

1. After Step 1, create a new orphan branch and commit everything:
   ```bash
   git checkout --orphan new-main
   git add .
   git commit -m "Initial commit"
   ```
2. Create the new repo on GitHub (Step 2).
3. Add the new remote (Step 3).
4. Push the new branch and optionally delete old branches:
   ```bash
   git push -u origin new-main
   ```

---

## Security note
Your previous remote URL contained a GitHub Personal Access Token. If that token was ever shared or committed, revoke it and create a new one:

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens**  
2. Revoke the old token and generate a new one if you need token-based HTTPS access.

Use the new token only in a secure place (e.g. credential helper, env var), not in `git remote` URLs stored in the repo.
