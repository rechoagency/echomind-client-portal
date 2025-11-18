# Frontend Merge Instructions

## ⚠️ IMPORTANT: These Files Need Manual Merging

The files in `updates_to_merge/` contain NEW features that need to be integrated into your existing `index.html` and `js/app.js` files. **DO NOT simply replace the entire files** - you'll lose existing functionality.

---

## 📋 Step-by-Step Merge Guide

### STEP 1: Update index.html (Add 2 New Tabs)

**File to edit:** `index.html`  
**Reference files:** `updates_to_merge/index_with_sliders_CORRECTED.html` and `updates_to_merge/04_analytics_dashboard_tab.html`

#### 1A: Add Tab Navigation Buttons

Find the nav-pills section (around line 40-60) and add these two new tabs:

```html
<!-- Add after the existing tabs -->
<li class="nav-item">
  <button class="nav-link" id="strategy-tab" data-bs-toggle="pill" 
          data-bs-target="#strategy" type="button">
    <i class="fas fa-chess"></i> Strategy
  </button>
</li>
<li class="nav-item">
  <button class="nav-link" id="analytics-tab" data-bs-toggle="pill" 
          data-bs-target="#analytics" type="button">
    <i class="fas fa-chart-line"></i> Analytics
  </button>
</li>
```

#### 1B: Add Strategy Tab Content

Find the tab-content div (where all the tab panes are) and add this entire section:

```html
<!-- Strategy Tab - Copy from updates_to_merge/index_with_sliders_CORRECTED.html -->
<!-- Look for: <div class="tab-pane fade" id="strategy" role="tabpanel"> -->
<!-- Copy the ENTIRE strategy tab-pane div (it's about 150 lines) -->
```

**What to copy:**
- Start from: `<div class="tab-pane fade" id="strategy" role="tabpanel">`
- End at: `</div><!-- End Strategy Tab -->`
- This includes all three sliders and their controls

#### 1C: Add Analytics Tab Content

```html
<!-- Analytics Tab - Copy from updates_to_merge/04_analytics_dashboard_tab.html -->
<!-- Copy the ENTIRE analytics tab-pane div (it's about 400 lines) -->
```

**What to copy:**
- Start from: `<div class="tab-pane fade" id="analytics" role="tabpanel">`
- End at: `</div><!-- End Analytics Tab -->`
- This includes summary cards, charts, and data tables

#### 1D: Add Chart.js Library (if not already present)

Add this before the closing `</body>` tag if it's not already there:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

---

### STEP 2: Update js/app.js (Add New Functions)

**File to edit:** `js/app.js`  
**Reference files:** `updates_to_merge/app_with_sliders_CORRECTED.js` and `updates_to_merge/05_file_upload_completion.js`

#### 2A: Add Slider Functions

Add these functions at the end of your `js/app.js` file:

```javascript
// ============================================
// THREE-SLIDER STRATEGY CONTROLS
// ============================================

// Load client settings from backend
async function loadClientSettings() {
    // Copy the entire loadClientSettings function from app_with_sliders_CORRECTED.js
    // It's about 40 lines
}

// Save client settings to backend
async function saveClientSettings() {
    // Copy the entire saveClientSettings function from app_with_sliders_CORRECTED.js
    // It's about 50 lines
}

// Update slider display values
function updateSliderDisplay(sliderId, value) {
    // Copy this function from app_with_sliders_CORRECTED.js
    // It's about 5 lines
}

// Event listeners for sliders
document.getElementById('replyPostSlider')?.addEventListener('input', function(e) {
    updateSliderDisplay('replyPostValue', e.target.value);
});

document.getElementById('brandMentionSlider')?.addEventListener('input', function(e) {
    updateSliderDisplay('brandMentionValue', e.target.value);
});

document.getElementById('productMentionSlider')?.addEventListener('input', function(e) {
    updateSliderDisplay('productMentionValue', e.target.value);
});

document.getElementById('saveStrategyBtn')?.addEventListener('click', saveClientSettings);

// Call loadClientSettings when dashboard loads
// Add this to your existing initialization code
loadClientSettings();
```

#### 2B: Replace uploadMoreDocuments() Function

Find the existing `uploadMoreDocuments()` function (it's probably a placeholder with an alert) and replace it entirely:

```javascript
// ============================================
// FILE UPLOAD COMPLETION
// ============================================

async function uploadMoreDocuments() {
    // Copy the ENTIRE function from 05_file_upload_completion.js
    // It's about 200 lines and includes:
    // - File picker creation
    // - Upload modal with progress bar
    // - Upload handling with fetch
    // - Success/error handling
}
```

#### 2C: Add Analytics Functions

Add these new functions for the analytics dashboard:

```javascript
// ============================================
// ANALYTICS DASHBOARD
// ============================================

async function loadAnalyticsSummary() {
    // Copy from app_with_sliders_CORRECTED.js if present
    // Or create based on the analytics tab structure
}

async function loadRecentDeliveries() {
    // Copy from app_with_sliders_CORRECTED.js if present
}

async function markContentUsed(contentId) {
    // Copy from app_with_sliders_CORRECTED.js if present
}

async function markContentSkipped(contentId) {
    // Copy from app_with_sliders_CORRECTED.js if present
}

// Add event listener to load analytics when tab is clicked
document.getElementById('analytics-tab')?.addEventListener('click', function() {
    loadAnalyticsSummary();
    loadRecentDeliveries();
});
```

---

## ✅ Verification Checklist

After merging, verify these features work:

### Strategy Tab
- [ ] Strategy tab appears in navigation
- [ ] Three sliders are visible and functional
- [ ] Reply/Post slider moves from 0-100%
- [ ] Brand Mention slider moves from 0-100%
- [ ] Product Mention slider moves from 0-100%
- [ ] Values update in real-time as you move sliders
- [ ] "Save Strategy" button works
- [ ] Settings persist after page refresh

### Analytics Tab
- [ ] Analytics tab appears in navigation
- [ ] Dashboard loads without errors
- [ ] Summary cards display (Total Delivered, Avg Score, Compliance Rate, Top Subreddit)
- [ ] Compliance chart renders correctly
- [ ] Recent deliveries table shows data
- [ ] "Mark as Used" and "Skip" buttons work

### File Upload
- [ ] Knowledge Base section has "Upload More Documents" button
- [ ] Clicking button opens file picker
- [ ] Progress modal appears during upload
- [ ] Success message shows when complete
- [ ] Files are vectorized automatically

---

## 🆘 Need Help?

If you're not comfortable with manual merging, you have two options:

### Option A: Use a Diff Tool
1. Install a diff/merge tool like:
   - VS Code (has built-in diff)
   - Meld (free, visual diff tool)
   - Beyond Compare (paid, powerful)
2. Compare `index.html` with `updates_to_merge/index_with_sliders_CORRECTED.html`
3. Compare `js/app.js` with `updates_to_merge/app_with_sliders_CORRECTED.js`
4. Cherry-pick the new sections

### Option B: Manual Testing Approach
1. Make a backup: `cp index.html index.html.backup`
2. Try the merge following the steps above
3. Test in browser
4. If something breaks, restore backup and try again

---

## 📝 Quick Reference: What Goes Where

| Source File | Destination | What to Copy |
|-------------|-------------|--------------|
| `index_with_sliders_CORRECTED.html` | `index.html` | Strategy tab navigation button + Strategy tab content |
| `04_analytics_dashboard_tab.html` | `index.html` | Analytics tab navigation button + Analytics tab content |
| `app_with_sliders_CORRECTED.js` | `js/app.js` | Slider functions + event listeners |
| `05_file_upload_completion.js` | `js/app.js` | Complete uploadMoreDocuments() function |

---

## 🚀 After Merging

Once you've completed the merge:

```bash
git add index.html js/app.js
git commit -m "Add three-slider strategy controls, analytics dashboard, and file upload"
git push origin feature/analytics-dashboard-sliders
```

Then create a Pull Request on GitHub and review the changes before merging to main.
