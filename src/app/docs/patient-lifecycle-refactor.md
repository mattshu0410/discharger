# Patient Lifecycle Refactor Plan

## Problem Statement

Current system has critical UX issues with temporary patient management:
- Users lose work when typing context/name but not clicking "Generate Discharge"
- Auto-save doesn't work for temporary patients (requires DB patient to exist)
- Complex state management with `new-` prefix system
- Inconsistent UX between temporary and real patients

## Solution Overview

Replace temporary patient system with immediate DB creation + cleanup approach:
1. Create patient in database when user enters meaningful content
2. Enable auto-save for all patients (no temporary state)
3. Clean up empty patients on navigation
4. Simplify state management and UI logic

## Implementation Plan

### Phase 1: Create Hybrid Patient Creation Logic

**Files to modify:**
- `src/stores/patientStore.ts` - Remove temporary patient logic
- `src/hooks/useNewPatient.ts` - Add hybrid creation logic
- `src/components/PatientForm.tsx` - Update creation triggers

**Changes:**
1. **Smart Creation Trigger**
   ```typescript
   const shouldCreatePatient = (name: string, context: string) => {
     return name.trim().length > 0 || context.trim().length > 0;
   };
   ```

2. **Auto-creation on Input**
   - Monitor name/context changes in PatientForm
   - Create patient when meaningful content entered
   - Update currentPatientId in store once created

3. **Remove `new-` Prefix System**
   - Delete `createNewPatient()` action from patientStore
   - Remove temporary patient display logic from Sidebar
   - Simplify patient selection logic

### Phase 2: Implement Cleanup System

**Files to modify:**
- `src/app/api/patients/[id]/route.ts` - Add cleanup endpoint
- `src/hooks/usePatientCleanup.ts` - New cleanup hook
- `src/components/Sidebar.tsx` - Trigger cleanup on navigation

**Changes:**
1. **Empty Patient Detection**
   ```typescript
   const shouldDeleteEmptyPatient = (patient: Patient) => {
     return !patient.name?.trim() && 
            !patient.context?.trim() && 
            !patient.discharge_text;
   };
   ```

2. **Navigation Cleanup**
   - Add beforeunload listener for page navigation
   - Add cleanup on patient switching in sidebar
   - Add cleanup on route changes

### Phase 3: Simplify State Management

**Files to modify:**
- `src/stores/patientStore.ts` - Remove temporary logic
- `src/components/Sidebar.tsx` - Remove temporary patient UI
- `src/components/PatientForm.tsx` - Simplify form logic

**Changes:**
1. **Remove Temporary Patient State**
   - Delete `isNewPatient` checks throughout codebase
   - Remove temporary patient styling and badges
   - Remove conditional auto-save logic

2. **Unified Patient Flow**
   - All patients behave identically
   - Auto-save works for all patients
   - Consistent UI across all patient states

### Phase 4: Update Auto-save System

**Files to modify:**
- `src/stores/patientStore.ts` - Simplify auto-save logic
- `src/hooks/useAutoSave.ts` - Remove temporary patient handling

**Changes:**
1. **Simplified Auto-save**
   ```typescript
   // Remove this condition check:
   if (context.trim() && autoSaveFunction) { // OLD
   
   // Always auto-save when patient exists:
   if (patientId && autoSaveFunction) { // NEW
   ```

## Detailed Implementation Steps

### Step 1: Update useNewPatient Hook
- Add hybrid creation logic with content detection
- Return creation status and auto-trigger functions
- Handle race conditions during creation

### Step 2: Modify PatientForm Component
- Add content monitoring for auto-creation
- Remove temporary patient conditional logic
- Simplify form submission flow

### Step 3: Update PatientStore
- Remove `createNewPatient()` action
- Remove `new-` prefix logic from `setCurrentPatientId`
- Simplify auto-save conditions

### Step 4: Simplify Sidebar Component
- Remove temporary patient display logic
- Remove `isNewPatient` checks
- Simplify patient list rendering

### Step 5: Add Cleanup System
- Create cleanup API endpoint
- Add navigation listeners for cleanup
- Implement patient switching cleanup

### Step 6: Testing & Validation
- Test patient creation flow
- Verify auto-save functionality
- Test cleanup on navigation
- Validate no data loss scenarios

## Risk Mitigation

### Database Pollution Prevention
- Only create patients with meaningful content
- Reliable cleanup on navigation away
- Periodic cleanup job consideration

### Race Condition Handling
- Debounce patient creation calls
- Handle concurrent creation/cleanup
- Proper loading states during creation

### User Experience Preservation
- Maintain fast, responsive interactions
- Clear loading indicators during creation
- Preserve existing keyboard shortcuts and workflows

## Success Criteria

1. ✅ No data loss when user types but doesn't generate discharge
2. ✅ Auto-save works immediately for all patients
3. ✅ Simplified codebase with removed temporary patient logic
4. ✅ Consistent UX across all patient interactions
5. ✅ Clean database with minimal empty patient records
6. ✅ No breaking changes to existing workflows

## Files to Modify Summary

**Core Logic:**
- `src/stores/patientStore.ts` - Remove temporary patient state
- `src/hooks/useNewPatient.ts` - Add hybrid creation logic
- `src/hooks/useAutoSave.ts` - Simplify auto-save conditions

**UI Components:**
- `src/components/PatientForm.tsx` - Update creation triggers
- `src/components/Sidebar.tsx` - Remove temporary patient UI

**API Endpoints:**
- `src/app/api/patients/[id]/route.ts` - Add cleanup endpoint

**New Files:**
- `src/hooks/usePatientCleanup.ts` - Cleanup logic hook

## Implementation Progress

### ✅ Completed Tasks
- Created implementation plan and todo tracking
- Step 1: Create hybrid patient creation logic in useNewPatient hook
  - Added `autoCreatePatient()` function for hybrid creation
  - Added `shouldCreatePatient()` helper to detect meaningful content
  - Added race condition protection with `isCreatingRef`
  - Maintained existing `createNewPatient()` for backward compatibility

### ✅ Completed Tasks (continued)
- Step 2: Update PatientForm to trigger creation on content input
  - Added auto-creation logic with 1-second debounce
  - Integrated `autoCreatePatient` and `shouldCreatePatient` from hook
  - Added background error handling (no user-facing toasts)

- Step 3: Remove temporary patient logic from patientStore
  - Removed `createNewPatient()` action, replaced with `initializeNewPatient()`
  - Simplified auto-save logic to always save when patientId exists
  - Removed `new-` prefix system completely
  - Updated `setCurrentPatientId` and `updateCurrentPatientContext` actions

- Step 4: Simplify Sidebar component UI
  - Removed all temporary patient display logic and styling
  - Removed `isNewPatient` checks and temporary patient badges
  - Simplified patient list rendering to show only real patients
  - Updated to use `initializeNewPatient()` action

- Step 5: Update PatientForm component
  - Removed all `isNewPatient` conditional logic
  - Simplified form initialization and patient loading
  - Updated UI to show "Create New Patient" state when no currentPatientId
  - Streamlined discharge generation and document selection flows

### ✅ Completed Tasks (continued)
- Step 6: Add cleanup system with navigation listeners
  - Created `usePatientCleanup` hook with empty patient detection
  - Added cleanup API endpoint at `/api/patients/cleanup`
  - Integrated cleanup into Sidebar for patient switching and new patient creation
  - Added beforeunload listener for page navigation cleanup
  - Used `navigator.sendBeacon` for reliable cleanup during page unload

### ✅ Completed Tasks (final)
- Step 7: Test complete flow and validate no data loss
  - ✅ FIXED BUG: Context disappearing when switching patients
  - Modified `setCurrentPatientId` to NOT clear context immediately
  - Enhanced `loadContextFromBackend` to properly sync with form
  - Added immediate form update when backend context loads

## 🐛 Bug Fix Summary

**Issue**: When switching between patients, the context would disappear from the UI even though it was saved in the backend.

**Root Cause**: Race condition between:
1. `setCurrentPatientId` clearing context immediately
2. Backend data loading and updating context
3. Form not syncing with updated context

**Solution**: 
1. Don't clear `currentPatientContext` immediately when switching patients
2. Let backend data load and update context naturally
3. Ensure form syncs immediately when backend context loads
4. Reset `isContextLoadedFromBackend` flag to allow fresh loading

### 🎉 Implementation Complete

All major refactoring tasks completed successfully:
- ✅ Hybrid patient creation system
- ✅ Removed temporary patient complexity  
- ✅ Simplified state management
- ✅ Added patient cleanup system
- ✅ Fixed context loading bugs
- ✅ No data loss - users can type and navigate safely

## Success Criteria Met

1. ✅ **No data loss**: Users can type content and navigate without losing work
2. ✅ **Auto-save works**: Patients are created automatically when typing
3. ✅ **Simplified codebase**: Removed complex temporary patient logic
4. ✅ **Consistent UX**: All patients behave identically
5. ✅ **Clean database**: Empty patients are cleaned up automatically
6. ✅ **Preserved workflows**: Existing functionality still works

## Implementation Order

1. Create hybrid patient creation logic in useNewPatient
2. Update PatientForm to trigger creation on content input
3. Remove temporary patient logic from patientStore
4. Simplify Sidebar component UI
5. Add cleanup system with navigation listeners
6. Test complete flow and validate no data loss