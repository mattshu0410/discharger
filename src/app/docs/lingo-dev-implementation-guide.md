# Lingo.dev Multi-Language Implementation Guide for PatientLayout

## Executive Summary

This guide outlines the simple implementation of Lingo.dev for multi-language support in the PatientLayout component. Lingo.dev automatically handles translations with minimal setup - just add the directive and use their built-in components.

## Overview

### Goals
- Enable multi-language support for patient discharge summaries
- Support 6 initial languages: English, Spanish, French, Chinese, Arabic, and Hindi
- Provide seamless language switching using Lingo.dev's built-in components
- Support RTL languages (Arabic)

### Why Lingo.dev?
- AI-powered translations with automatic content extraction
- Built-in LocaleSwitcher component
- No manual translation file management
- Automatic build-time translation generation
- Works out of the box with React and Next.js

## Implementation Plan

### Phase 1: Setup and Configuration

#### 1.1 Install Dependencies
```bash
npm install lingo.dev
```

#### 1.2 Update Next.js Configuration
Modify `next.config.mjs`:

```javascript
// next.config.mjs
import lingoCompiler from 'lingo.dev/compiler';

const nextConfig = {
  // ... existing configuration
};

export default lingoCompiler.next({
  ...nextConfig,
  sourceLocale: 'en',
  targetLocales: ['es', 'fr', 'zh', 'ar', 'hi'],
  models: 'lingo.dev'
});
```

#### 1.3 Environment Setup
Add to `.env.local`:
```bash
LINGODOTDEV_API_KEY=your_api_key_here
```

#### 1.4 Authentication
```bash
npx lingo.dev@latest login
```

### Phase 2: Update PatientLayout Component

#### 2.1 Simple PatientLayout with Built-in Components
Update `src/components/PatientLayout.tsx`:

```typescript
'use client';
"use i18n"; // Enable automatic translation - that's it!

import type { Block, PatientProgress } from '@/types/blocks';
import { MessageCircle, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LocaleSwitcher } from 'lingo.dev/react/client';
import { AppointmentBlock } from '@/components/blocks/AppointmentBlock';
import { MedicationBlock } from '@/components/blocks/MedicationBlock';
import { RedFlagBlock } from '@/components/blocks/RedFlagBlock';
import { TaskBlock } from '@/components/blocks/TaskBlock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

// Simple Floating Chat - all text automatically translated
export const FloatingChat = ({ isPreview = false }: FloatingChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(!isPreview);

  return (
    <div className="absolute bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-80 h-96 shadow-xl border-2">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Medical Assistant</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                ×
              </Button>
            </div>

            <div className="flex-1 bg-muted/30 rounded-lg p-3 mb-3 overflow-y-auto">
              <div className="space-y-3">
                <div className="bg-primary/10 p-3 rounded-lg text-sm border border-primary/20">
                  Hi John! I'm here to help with any questions about your recovery. How are you feeling today?
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    Suggested questions:
                  </p>
                  <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2 text-left">
                    When should I take my next medication?
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2 text-left">
                    What activities should I avoid?
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2 text-left">
                    I'm experiencing mild pain, is this normal?
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Type your question..."
                className="flex-1"
                disabled={isPreview}
              />
              <Button size="sm" disabled={isPreview}>
                <MessageCircle className="w-4 h-4 mr-1" />
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          className="w-14 h-14 rounded-full shadow-xl relative hover:scale-105 transition-transform"
          onClick={() => {
            setIsOpen(true);
            setHasUnread(false);
          }}
        >
          <MessageCircle className="w-6 h-6" />
          {hasUnread && (
            <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 bg-red-500 hover:bg-red-500 animate-pulse">
              !
            </Badge>
          )}
        </Button>
      )}
    </div>
  );
};

// Main PatientLayout component
export function PatientLayout({
  blocks,
  progress,
  onBlockUpdate,
  onBlockInteraction,
  isPreview = false,
  patientName = 'John Doe',
  dischargeDate = 'Jan 15, 2024',
}: PatientLayoutProps) {
  const renderBlock = (block: Block) => {
    const blockProps = {
      key: block.id,
      block,
      mode: 'patient' as const,
      onUpdate: (updatedBlock: Block) => onBlockUpdate(block.id, updatedBlock),
      onInteraction: (type: string, data: any) => onBlockInteraction?.(block.id, type, data),
    };
    
    switch (block.type) {
      case 'medication':
        return <MedicationBlock {...blockProps} />;
      case 'task':
        return <TaskBlock {...blockProps} />;
      case 'redFlag':
        return <RedFlagBlock {...blockProps} />;
      case 'appointment':
        return <AppointmentBlock {...blockProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-primary-50 to-background relative">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-semibold">{patientName}</h1>
              <p className="text-primary-foreground/80 text-sm">
                Discharged {dischargeDate}
              </p>
              {isPreview && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  Preview Mode
                </Badge>
              )}
            </div>
            
            {/* Use Lingo's built-in language switcher */}
            <LocaleSwitcher 
              locales={["en", "es", "fr", "zh", "ar", "hi"]}
              variant="secondary"
              size="sm"
              disabled={isPreview}
            />
          </div>

          {/* Progress Bar - text automatically translated */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>
                {progress.completedTasks}/{progress.totalTasks} tasks completed
              </span>
            </div>
            <Progress value={progress.overallCompletion} className="h-2" />
          </div>
        </div>
      </div>

      {/* Content - all text automatically translated */}
      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-20">
        {/* Welcome Message */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <h2 className="font-semibold text-primary mb-2">
              Welcome to Your Recovery Guide
            </h2>
            <p className="text-sm text-muted-foreground">
              This personalized guide will help you track your medications, complete important tasks, and know when to seek help. Your progress is automatically saved.
            </p>
          </CardContent>
        </Card>

        {/* Blocks */}
        {blocks.map(renderBlock)}

        {/* Emergency Contact Card */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-900">
                24/7 Support
              </span>
            </div>
            <p className="text-sm text-red-700 mb-3">
              If you have any concerns about your recovery, don't hesitate to reach out.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              disabled={isPreview}
              asChild
            >
              <a href="tel:000">
                <Phone className="w-4 h-4 mr-1" />
                Call 000
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>Generated by Discharger • Your personalized recovery companion</p>
        </div>
      </div>

      {/* Floating Chat */}
      <FloatingChat isPreview={isPreview} />
    </div>
  );
}
```

### Phase 3: Update Block Components

#### 3.1 Simple Block Translation
Update each block component to add the directive:

```typescript
// src/components/blocks/MedicationBlock.tsx
'use client';
"use i18n"; // Add this directive - everything else stays the same!

export function MedicationBlock({ block, mode, onUpdate, onInteraction }: BlockProps<MedicationBlock>) {
  if (mode === 'patient') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💊</span>
            <span>Medications</span> {/* Auto-translated */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {block.data.medications.map((medication) => (
              <div key={medication.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{medication.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {medication.dosage} - {medication.frequency}
                    </p>
                    {medication.instructions && (
                      <p className="text-sm mt-1">{medication.instructions}</p>
                    )}
                  </div>
                  <Badge variant={medication.status === 'new' ? 'default' : 'secondary'}>
                    {medication.status} {/* Auto-translated */}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Doctor mode remains the same
  // ...
}
```

#### 3.2 Update All Block Components
Add `"use i18n";` to:
- `src/components/blocks/TaskBlock.tsx`
- `src/components/blocks/RedFlagBlock.tsx` 
- `src/components/blocks/AppointmentBlock.tsx`

## Implementation Timeline

### Day 1: Setup (2 hours)
- [ ] Install Lingo.dev: `npm install lingo.dev`
- [ ] Update Next.js config with compiler
- [ ] Set up API key and authenticate
- [ ] Test build process

### Day 2: Basic Implementation (4 hours)
- [ ] Add `"use i18n"` directive to PatientLayout
- [ ] Replace custom language switcher with `LocaleSwitcher`
- [ ] Add directive to all block components
- [ ] Test with English and Spanish

### Day 3: Testing & Optimization (2 hours)
- [ ] Test all 6 languages
- [ ] Verify RTL support for Arabic
- [ ] Check medical terminology accuracy
- [ ] Performance testing

## Testing Strategy

### 1. Simple Translation Tests
- Verify LocaleSwitcher changes language
- Ensure static text is translated
- Test RTL layout for Arabic
- Check that medical dosages remain unchanged

### 2. Medical Accuracy
- Emergency numbers (000, 999) preserved
- Medication dosages stay as-is (500mg → 500mg)
- Critical medical terms translated appropriately

## Best Practices

### 1. What Gets Translated Automatically
- All JSX text content
- Placeholder text
- Button labels
- Static strings

### 2. What Doesn't Get Translated
- Medical dosages (500mg, 2x daily)
- Emergency phone numbers
- Patient names
- Database IDs

### 3. Performance
- Translations generated at build time
- No runtime translation overhead
- Automatic caching by Lingo.dev

## Rollback Plan

If issues arise:
1. Remove `"use i18n"` directives
2. Replace `LocaleSwitcher` with static EN button
3. Revert to English-only UI

## Quick Start Summary

1. **Install**: `npm install lingo.dev`
2. **Configure**: Update `next.config.mjs`
3. **Authenticate**: `npx lingo.dev@latest login`
4. **Add directive**: `"use i18n"` to components
5. **Use switcher**: `<LocaleSwitcher locales={["en", "es", "fr", "zh", "ar", "hi"]} />`
6. **Done!**

## Why This Approach Works

- **Zero custom code**: Uses Lingo.dev's built-in components
- **Automatic translation**: No manual string management
- **Medical accuracy**: AI understands medical context
- **Performance**: Build-time generation
- **Easy maintenance**: Just add the directive to new components

This simplified approach reduces implementation from weeks to days while maintaining all the benefits of multi-language support.