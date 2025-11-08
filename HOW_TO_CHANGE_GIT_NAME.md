# 🔧 How to Change Git Author Name

**Current Configuration**:
- Name: BavanthikaAS
- Email: bavanthika@example.com

**Issue**: All commits show "BavanthikaAS" on GitHub

---

## 🎯 Quick Fix (Recommended)

### Change for ALL repositories:

```powershell
# Set your name (will appear on GitHub)
git config --global user.name "cnp3301-wq"

# Set your email (should match GitHub email)
git config --global user.email "cnp3301@gmail.com"
```

### Change for THIS repository only:

```powershell
# Set name for this project only
git config user.name "cnp3301-wq"

# Set email for this project only
git config user.email "cnp3301@gmail.com"
```

---

## 💡 Name Suggestions

Choose a name that will appear on GitHub:

1. **GitHub Username**: `cnp3301-wq` (matches your GitHub account)
2. **Organization**: `KPRCAS Team`
3. **Department**: `KPRCAS CSE`
4. **Project**: `Attendance System Team`
5. **Your Name**: `Your Real Name`

---

## ✅ Verify Changes

After running the commands:

```powershell
# Check if name changed
git config user.name

# Check if email changed
git config user.email
```

**Expected Output**:
```
cnp3301-wq
cnp3301@gmail.com
```

---

## 🔄 Apply to Future Commits

After changing:
1. ✅ All **new commits** will use the new name
2. ✅ Next **git push** will show new name on GitHub
3. ❌ Old commits keep their original name (can't change easily)

---

## 📋 Complete Example

```powershell
# Step 1: Change name globally
git config --global user.name "cnp3301-wq"
git config --global user.email "cnp3301@gmail.com"

# Step 2: Verify
git config user.name
# Output: cnp3301-wq

git config user.email
# Output: cnp3301@gmail.com

# Step 3: Make a test commit
git add .
git commit -m "Test commit with new name"
git push origin master

# Step 4: Check GitHub - should show "cnp3301-wq" ✅
```

---

## 🎨 What Appears on GitHub

### Before:
```
BavanthikaAS committed 7 minutes ago
```

### After:
```
cnp3301-wq committed just now
```

---

## ⚠️ Important Notes

1. **GitHub Account Match**:
   - If email matches your GitHub account email → Shows your GitHub profile
   - If email doesn't match → Shows as plain text name

2. **Recommended Email**:
   - Use the same email as your GitHub account
   - Check GitHub → Settings → Emails

3. **Global vs Local**:
   - `--global`: Applies to all repositories on your computer
   - No flag: Applies to current repository only

---

## 🔍 Current GitHub Account

Your GitHub username: **cnp3301-wq**

**Recommended Settings**:
```powershell
git config --global user.name "cnp3301-wq"
git config --global user.email "cnp3301@gmail.com"
```

This makes commits show with your GitHub username!

---

**Date**: November 8, 2025  
**Status**: Ready to Change
