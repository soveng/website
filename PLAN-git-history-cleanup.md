# Git History Cleanup Plan

## Current State

- `.git` size: **119 MB**
- Total blobs in history: 129 MB across 1,777 files
- Large files (>500KB): 72 files totaling **97 MB**

### Breakdown by Category

| Category | Files | Size | Status |
|----------|-------|------|--------|
| `src/data/common-slides/` | 20 | 25 MB | Deleted from repo |
| `public/images/swag/*.png/*.jpg` | 15 | 24 MB | Deleted (kept WebP only) |
| `src/assets/images/` | 28 | 39 MB | Optimized (old versions) |
| `public/images/` (other) | 24 | 33 MB | Optimized/deleted |

---

## Tiered Approach

### Tier 1: Analysis Only (Safe)
**Risk: None** | **Savings: 0**

- [x] Analyze git history for large blobs
- [x] Categorize files by directory/type
- [x] Document current state
- [ ] Install `git-filter-repo` if not present
- [ ] Create backup of repo before any changes

### Tier 2: Remove Deleted Directories
**Risk: Low** | **Estimated Savings: ~25 MB**

Remove files from directories that no longer exist in the repo:
```
src/data/common-slides/     # 20 files, 25 MB
src/data/no-solutions-transcripts/  # if present
```

**Command:**
```bash
git filter-repo --path src/data/common-slides/ --invert-paths
git filter-repo --path src/data/no-solutions-transcripts/ --invert-paths
```

### Tier 3: Remove Old Swag Formats
**Risk: Low-Medium** | **Estimated Savings: ~24 MB**

Remove PNG/JPG versions of swag images (WebP versions retained):
```
public/images/swag/*.png
public/images/swag/*.jpg
```

**Command:**
```bash
git filter-repo --path-glob 'public/images/swag/*.png' --invert-paths
git filter-repo --path-glob 'public/images/swag/*.jpg' --invert-paths
```

### Tier 4: Remove Old Image Versions
**Risk: Medium** | **Estimated Savings: ~50-70 MB**

Remove historical versions of images we optimized:
- Old `flowers.jpg` (4.9 MB → 571 KB)
- Old `tenex-logo.png` (1.8 MB → 69 KB WebP)
- Old avatars, etc.

**Approach:** Use `--strip-blobs-bigger-than 1M` or targeted path removal

**Command (aggressive):**
```bash
git filter-repo --strip-blobs-bigger-than 500K
```

**Command (targeted):**
```bash
# List of specific files to remove old versions
git filter-repo --path public/images/showcase/tenex-logo.png --invert-paths
git filter-repo --path public/images/tim-bouma-avatar.png --invert-paths
# ... etc
```

---

## Execution Plan

### Prerequisites
```bash
# Install git-filter-repo
pip install git-filter-repo
# OR
sudo apt install git-filter-repo

# Create full backup
cd ..
cp -r website website-backup-$(date +%Y%m%d)
```

### Execution Order
1. Create dedicated branch for tracking (documentation only)
2. Execute Tier 2 (deleted directories)
3. Verify repo integrity: `git fsck && bun build`
4. Execute Tier 3 (old swag formats)
5. Verify again
6. Execute Tier 4 (old image versions) - optional
7. Final verification
8. Force push to remote
9. All collaborators must re-clone

### Post-Cleanup
```bash
# Verify new size
du -sh .git

# Run garbage collection
git gc --aggressive --prune=now

# Force push (DESTRUCTIVE - coordinates with team first!)
git push --force --all
git push --force --tags
```

---

## Warnings

⚠️ **Force push required** - All collaborators must re-clone after cleanup

⚠️ **Backup first** - Create full backup before any filter-repo commands

⚠️ **One-way operation** - History rewriting cannot be undone easily

⚠️ **PR/Issues** - Open PRs will be invalidated by history rewrite

---

## Expected Results

| Tier | Cumulative .git Size | Reduction |
|------|---------------------|-----------|
| Current | 119 MB | - |
| After Tier 2 | ~95 MB | ~24 MB |
| After Tier 3 | ~70 MB | ~49 MB |
| After Tier 4 | ~40-50 MB | ~70-80 MB |

---

## Rollback

If something goes wrong:
```bash
# Restore from backup
rm -rf website
cp -r website-backup-YYYYMMDD website
```
