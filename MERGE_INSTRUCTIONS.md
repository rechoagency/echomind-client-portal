# Frontend Merge Instructions

## IMPORTANT: Manual Merge Required

These files need to be MERGED into existing files, not replaced:

### Files to Update:
1. **index.html** - Add Strategy tab + Analytics tab
2. **js/app.js** - Add slider functions + file upload + analytics

### Reference Files (in updates_to_merge/):
- index_with_sliders_CORRECTED.html - Strategy tab HTML
- 04_analytics_dashboard_tab.html - Analytics tab HTML  
- app_with_sliders_CORRECTED.js - Slider JavaScript
- 05_file_upload_completion.js - File upload function

## Quick Merge Guide:

### 1. index.html Changes:
- Add Strategy tab button to navigation
- Add Analytics tab button to navigation
- Copy entire Strategy tab content from index_with_sliders_CORRECTED.html
- Copy entire Analytics tab content from 04_analytics_dashboard_tab.html
- Add Chart.js CDN: <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

### 2. js/app.js Changes:
- Add loadClientSettings() function
- Add saveClientSettings() function
- Add slider event listeners
- Replace uploadMoreDocuments() with complete version from 05_file_upload_completion.js
- Add analytics functions (loadAnalyticsSummary, etc.)

## After Merging:
Test all three sliders work independently
Test analytics dashboard loads
Test file upload opens picker

See detailed instructions in the reference files.
