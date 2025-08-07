# Discharge Summary and Onboarding Improvement Plan
*Updated: 2025-01-08*

## ✅ COMPLETED TASKS

### Exemplar Report Functionality Testing & Fixes
- **Status:** ✅ COMPLETED
- **Issues Found & Fixed:**
  - Fixed state initialization bug in profile page
  - Fixed null value handling in useEffect
  - Validated API structure and data flow
- **Testing:** Manual testing confirmed functionality works correctly

## 🚧 CURRENT IMPLEMENTATION PLAN

### Phase 1: Data Structure & Organization

#### 1.1 Use Existing CSV Files as Single Source of Truth
- **Problem:** Medical titles and departments are hard-coded in both onboarding and profile pages
- **Solution:** Create utilities to read from existing CSV files in `public/assets/files/`
- **Existing Files:**
  - `public/assets/files/australian_medical_titles.csv`
  - `public/assets/files/clinical_departments.csv`
- **Benefits:** Single source of truth, no data duplication, easier maintenance

#### 1.2 Adjust System Prompt Logic
- **Location:** `src/app/api/discharge/route.ts`
- **Current Status:** ✅ Already implemented correctly
- **Logic Confirmed:**
  - **Priority 1:** User's custom exemplar report
  - **Priority 2:** Department-specific exemplar from `tests/discharger/[department-name]/reports/1.txt`
  - **Priority 3:** Fall back to `tests/discharger/emergency-medicine/reports/1.txt`

### Phase 2: Onboarding UI/UX Improvements

#### 2.1 Fix Onboarding Page Layout
- **Problem:** Onboarding page doesn't match sign-in page styling
- **Current Layout:** Basic container with max-width
- **Target Layout:** Match `src/app/(auth)/(center)/layout.tsx` styling
- **Components to Reuse:** Professional Information section from profile page

#### 2.2 Multi-Step Onboarding Flow
- **Step 1:** Professional Information Collection
  - Medical Title (from data file)
  - Department (from data file)  
  - Hospital (from hospitals table)
- **Step 2:** Exemplar Report Collection
  - Show example discharge report
  - Optional user input
  - "Skip for now" option with settings redirect

#### 2.3 Onboarding Tour Implementation
- **Technology:** Implement with NextStepJS (replace Onborda)
- **Trigger:** After onboarding completion
- **Content:** Show users how to use key features

### Phase 3: User Flow & Middleware Implementation

#### 3.1 Middleware-Based Onboarding Check
- **Problem:** Users were being redirected to discharge page first, then to onboarding
- **Solution:** Implement onboarding check in middleware for centralized routing
- **Implementation:** 
  - Added onboarding check in `src/middleware.ts`
  - Removed onboarding check from discharge page
  - Middleware now handles all authenticated user routing
- **Benefits:** Cleaner user flow, centralized logic, no unnecessary redirects

#### 3.2 User Flow Optimization
- **New Flow:** Sign-in → Middleware checks onboarding → Onboarding (if needed) → Discharge
- **Old Flow:** Sign-in → Discharge → Check onboarding → Redirect to onboarding
- **Improvement:** Eliminates unnecessary redirect and improves UX

### Phase 4: Development Testing Setup

#### 4.1 Create Development Testing Workflow
- **Method 1:** Database reset command for testing
- **Method 2:** Test user creation workflow
- **Method 3:** Environment variable for forcing onboarding

## 🎯 EXECUTION ORDER

1. **Create data files** (medical titles, departments)
2. **Update both onboarding and profile pages** to use data files
3. **Improve onboarding page layout** to match sign-in styling
4. **Implement multi-step onboarding flow**
5. **Add exemplar report step** with example and skip option
6. **Implement tour system** with NextStepJS
7. **Create development testing setup**

## 📁 FILES TO MODIFY

### New Files
- `src/libs/csv-data.ts` (utility for loading CSV data files)

### Modified Files  
- `src/app/(auth)/(center)/onboarding/page.tsx`
- `src/app/(auth)/(sidebar)/profile/page.tsx`
- Package dependencies (add NextStepJS, remove Onborda)

## 🧪 TESTING STRATEGY

### Development Testing
- **Onboarding Reset:** SQL command to reset `onboarding_completed = false`
- **Direct Access:** Navigate to `/onboarding` 
- **New User Flow:** Create test accounts

### Manual Testing Checklist
- [ ] Data files load correctly
- [ ] Onboarding layout matches sign-in
- [ ] Professional info step works
- [ ] Exemplar report step works
- [ ] Skip options work
- [ ] Tour triggers correctly
- [ ] Data persists correctly

## 🚀 DEPLOYMENT CONSIDERATIONS

- Data files in `data/` directory will be included in build
- No database schema changes required (exemplar_report column exists)
- Backward compatibility maintained for existing users