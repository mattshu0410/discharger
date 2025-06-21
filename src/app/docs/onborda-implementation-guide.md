# Onborda Implementation Guide for Discharger

## Overview

This document provides a comprehensive guide for the **Onborda** onboarding tour implementation in the Discharger application. This serves as a handover document for future developers who may need to refactor this system to use **NextStep** or other onboarding libraries.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Implementation Details](#implementation-details)
3. [File Structure](#file-structure)
4. [Database Integration](#database-integration)
5. [Component Breakdown](#component-breakdown)
6. [Configuration](#configuration)
7. [Known Issues & Limitations](#known-issues--limitations)
8. [Migration Strategy to NextStep](#migration-strategy-to-nextstep)
9. [Testing & Debugging](#testing--debugging)

---

## Architecture Overview

The onboarding system is built around **Onborda**, a React-based product tour library that uses framer-motion for animations. The implementation follows a client-side pattern with server-side state persistence.

### Core Flow
```
1. User loads app → Clerk authentication
2. useOnboarding hook checks `onboarding_completed` field
3. If false → Start Onborda tour after 1s delay
4. Tour shows custom TourCard components
5. User completes tour → Event dispatched
6. Database updated → `onboarding_completed: true`
```

### Key Components
- **OnbordaProvider** + **Onborda** (layout level)
- **TourCard** (custom card component)
- **useOnboarding** (client-side hook)
- **Steps configuration** (tour definition)
- **Database integration** (Supabase profiles table)

---

## Implementation Details

### 1. Provider Setup (`src/app/layout.tsx`)

```tsx
import { OnbordaProvider, Onborda } from 'onborda';
import { TourCard } from '@/components/TourCard';
import steps from '@/libs/onboarding-steps';

<OnbordaProvider>
  <Onborda
    steps={steps as any}
    showOnborda={true}
    cardComponent={TourCard}
    shadowRgb="0,0,0"
    shadowOpacity="0.7"
  >
    {children}
  </Onborda>
</OnbordaProvider>
```

### 2. Custom Card Component (`src/components/TourCard.tsx`)

- Built with **shadcn/ui** components
- Event-based completion communication
- No direct Clerk dependencies (to avoid SSR issues)
- Professional styling with navigation controls

Key features:
- Progress indicator ("Step X of Y")
- Previous/Next navigation buttons
- Close button for early exit
- Finish button on final step
- Custom event dispatch for completion

### 3. Client Hook (`src/hooks/useOnboarding.ts`)

Uses **useCallback** and proper cleanup patterns:
- Checks user authentication state
- Monitors `onboarding_completed` database field
- Starts tour with 1-second delay
- Listens for completion events
- Updates database on completion

### 4. Steps Configuration (`src/libs/onboarding-steps.ts`)

11-step tour covering:
1. Welcome message
2. Patient context entry
3. Document selector (@)
4. Snippet selector (/)
5. Discharge generation
6. Citation system
7. Context viewer
8. Feedback system
9. Memory page navigation
10. Snippets page navigation
11. Completion message

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                    # Provider setup
│   └── api/users/profile/route.ts    # Database API
├── components/
│   └── TourCard.tsx                  # Custom card UI
├── hooks/
│   └── useOnboarding.ts              # Main logic hook
├── libs/
│   └── onboarding-steps.ts           # Tour configuration
├── styles/
│   └── global.css                    # Onborda z-index styles
└── types/
    └── index.ts                      # Type definitions
```

---

## Database Integration

### Schema Addition
Added `onboarding_completed` field to Supabase `profiles` table:

```sql
ALTER TABLE profiles 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
```

### API Updates
Updated `/api/users/profile/route.ts` to handle the new field:

- **GET**: Returns `onboarding_completed` status
- **PUT**: Accepts `onboarding_completed` updates
- **POST**: Creates new profiles with `onboarding_completed: false`

### Type System
```tsx
// src/types/index.ts
export type UserProfile = {
  // ... existing fields
  onboarding_completed?: boolean;
}

// src/api/users/types.ts
export type UpdateProfileRequest = {
  // ... existing fields
  onboarding_completed?: boolean;
}
```

---

## Component Breakdown

### TourCard Component

**Architecture Decision**: The card uses event-based communication instead of direct hook calls to avoid Clerk provider issues at the layout level.

```tsx
// Event dispatch instead of direct hook call
async function handleFinish() {
  window.dispatchEvent(new CustomEvent('onboarding-completed'));
  closeOnborda();
}
```

**Styling**: Uses shadcn/ui components with custom styling:
- `Card`, `CardHeader`, `CardContent`, `CardFooter`
- Lucide icons for navigation
- Primary color scheme integration
- Responsive design principles

### useOnboarding Hook

**Performance Optimizations**:
- `useCallback` for `completeOnboarding` function
- Proper cleanup with `clearTimeout`
- Event listener cleanup in useEffect

**Authentication Flow**:
```tsx
// Only runs when user is authenticated and profile loaded
if (user && userProfile && !userProfile.onboarding_completed) {
  // Start tour with delay for DOM readiness
}
```

---

## Configuration

### Target Element IDs
The tour targets specific DOM elements with these IDs:

```tsx
// Added to existing components
'#patient-context-textarea'    // PatientForm.tsx
'#generate-discharge-btn'      // PatientForm.tsx  
'#sidebar-toggle'              // Sidebar.tsx
'#new-patient-btn'             // Sidebar.tsx
'#memory-nav-link'             // Sidebar.tsx
'#snippets-nav-link'           // Sidebar.tsx
'#discharge-summary-panel'     // DischargeSummaryPanel.tsx
'#context-viewer-toggle'       // page.tsx
'#feedback-input'              // FeedbackInput.tsx (existing)
'#sidebar'                     // Sidebar.tsx
```

### CSS Enhancements
Added z-index styles to ensure overlay visibility:

```css
/* src/styles/global.css */
.onborda-overlay {
  z-index: 9999 !important;
}
.onborda-card {
  z-index: 10000 !important;
}
.onborda-pointer {
  z-index: 10001 !important;
}
```

---

## Known Issues & Limitations

### Onborda Limitations (Reasons for NextStep Migration)

1. **No Built-in Card Component**: Requires custom card implementation
2. **SSR Issues**: Complex setup needed to avoid Clerk provider conflicts
3. **Limited Customization**: Styling and behavior options are restricted
4. **Event-based Communication**: Necessary workaround adds complexity
5. **TypeScript Issues**: Requires `as any` type assertions
6. **Documentation**: Limited examples and documentation
7. **Bundle Size**: Includes framer-motion dependency

### NextStep Migration Issues

**Current Bug**: There is a bug in the NextStep implementation where the `onSkip` callback is fired instead of `onComplete` when finishing the tour in `src/components/TourProvider.tsx`. This appears to be a NextStep library issue where the "Finish" button action is treated as a skip event rather than a completion event. 

**Workaround**: The current implementation handles completion through the `onSkip` callback when the tour name matches 'onboarding'.

### Current Workarounds

1. **Custom Event System**: Used to communicate completion between layout and client components
2. **Delayed Tour Start**: 1-second delay to ensure DOM readiness
3. **Type Assertions**: `steps as any` to bypass TypeScript issues
4. **Manual Z-index**: CSS overrides for proper overlay display

---

## Migration Strategy to NextStep

### Advantages of NextStep
- Built-in card components
- Better TypeScript support
- More flexible configuration
- Smaller bundle size
- Better SSR support
- Active maintenance

### Migration Steps

#### 1. Dependency Replacement
```bash
npm uninstall onborda
npm install nextstepjs
```

#### 2. Provider Setup
```tsx
// Replace Onborda provider with NextStep
import { NextStepProvider } from 'nextstepjs';

<NextStepProvider>
  {children}
</NextStepProvider>
```

#### 3. Hook Migration
```tsx
// Update useOnboarding hook
import { useNextStep } from 'nextstepjs';

const { startTour, endTour } = useNextStep();
```

#### 4. Steps Configuration
NextStep uses a different configuration format - will need to convert the steps array.

#### 5. Remove Custom Components
- Delete `TourCard.tsx` (NextStep has built-in cards)
- Remove custom event system
- Simplify useOnboarding hook

#### 6. Clean Up
- Remove z-index CSS overrides
- Remove `as any` type assertions
- Simplify layout.tsx

### Migration Checklist

- [ ] Install NextStep and remove Onborda
- [ ] Convert steps configuration format
- [ ] Update useOnboarding hook to use NextStep APIs
- [ ] Remove TourCard component
- [ ] Update layout.tsx provider setup
- [ ] Remove custom CSS overrides
- [ ] Test tour functionality
- [ ] Test database completion flow
- [ ] Update type definitions
- [ ] Update documentation

---

## Testing & Debugging

### Manual Testing Steps
1. **New User Flow**: Create new account, verify tour starts
2. **Completion Flow**: Complete tour, verify database update
3. **Existing User Flow**: Login with completed onboarding, verify no tour
4. **Early Exit**: Close tour early, verify it restarts on reload
5. **Navigation**: Test tour navigation between pages
6. **Element Targeting**: Verify all target elements exist

### Debug Tools
```javascript
// Browser console debugging
document.getElementById('patient-context-textarea'); // Check target elements
document.querySelector('.onborda-overlay');          // Check overlay exists
window.dispatchEvent(new CustomEvent('onboarding-completed')); // Test completion
```

### Common Issues
1. **Tour doesn't start**: Check Clerk authentication and user profile loading
2. **Elements not found**: Verify target IDs exist in DOM
3. **Overlay not visible**: Check z-index styles and CSS conflicts
4. **Database not updating**: Check event listener and API calls

---

## Conclusion

This Onborda implementation provides a functional onboarding system but has several limitations that make NextStep a better long-term choice. The current implementation serves as a working foundation that can be migrated to NextStep with the strategy outlined above.

The key architectural decisions (database integration, user flow, and target elements) remain valid for the NextStep migration, making the transition primarily a library replacement rather than a complete rewrite.

---

## Author Notes

**Implementation Date**: December 2024  
**Library Version**: Onborda latest  
**Known Working State**: Functional with workarounds  
**Migration Priority**: High (due to Onborda limitations)  
**Estimated Migration Time**: 1-2 days

For questions or clarification on this implementation, refer to the git commit history around the onboarding feature implementation.