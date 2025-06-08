'use client';
import type { Document, Snippet } from '@/types';
import { getPatientById } from '@/api/patients/hooks';
import { DocumentSelector } from '@/components/DocumentSelector';
import { SnippetSelector } from '@/components/SnippetSelector';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Textarea } from '@/components/ui/textarea';
import { useUIStore } from '@/stores';
import { usePatientStore } from '@/stores/patientStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// This giant behemoth of a function literally just calculates the position of the cursor. Is it hacky, yes. Does it work, yes. Do I care, no.
const calculateCursorPosition = (textarea: HTMLTextAreaElement, cursorPos: number) => {
  // Create a mirror div to measure cursor position
  const mirror = document.createElement('div');
  const computed = window.getComputedStyle(textarea);

  // Copy textarea styles to mirror - be more precise
  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.left = '-9999px';
  mirror.style.top = '-9999px';
  mirror.style.width = `${textarea.clientWidth}px`;
  mirror.style.height = 'auto';
  mirror.style.fontSize = computed.fontSize;
  mirror.style.fontFamily = computed.fontFamily;
  mirror.style.fontWeight = computed.fontWeight;
  mirror.style.lineHeight = computed.lineHeight;
  mirror.style.padding = computed.padding;
  mirror.style.border = computed.border;
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.wordWrap = 'break-word';
  mirror.style.overflow = 'hidden';

  document.body.appendChild(mirror);

  // Get text up to cursor
  const textBeforeCursor = textarea.value.substring(0, cursorPos);
  const uniqueId = `cursor-marker-${Date.now()}`;
  mirror.innerHTML = `${textBeforeCursor.replace(/\n/g, '<br>')}<span id="${uniqueId}"></span>`;

  // Get cursor marker position
  const cursorMarker = document.getElementById(uniqueId);

  if (!cursorMarker) {
    document.body.removeChild(mirror);
    return { x: 0, y: 0 };
  }

  const textareaRect = textarea.getBoundingClientRect();

  // Calculate relative position within the mirror
  const markerRect = cursorMarker.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();

  // Clean up
  document.body.removeChild(mirror);

  // Calculate absolute position
  const relativeX = markerRect.left - mirrorRect.left;
  const relativeY = markerRect.top - mirrorRect.top;

  return {
    x: textareaRect.left + relativeX + window.scrollX,
    y: textareaRect.top + relativeY + window.scrollY,
  };
};

export function PatientForm() {
  // Get state from the simplified patient store
  const currentPatientId = usePatientStore(state => state.currentPatientId);
  const currentPatientContext = usePatientStore(state => state.currentPatientContext);
  const updateCurrentPatientContext = usePatientStore(state => state.updateCurrentPatientContext);
  const loadContextFromBackend = usePatientStore(state => state.loadContextFromBackend);
  const isGenerating = usePatientStore(state => state.isGenerating);
  const setIsGenerating = usePatientStore(state => state.setIsGenerating);
  const selectedDocuments = usePatientStore(state => state.selectedDocuments);
  const addDocument = usePatientStore(state => state.addDocument);
  const removeDocument = usePatientStore(state => state.removeDocument);

  // UI state from uiStore
  const openDocumentSelector = useUIStore(state => state.openDocumentSelector);
  const closeDocumentSelector = useUIStore(state => state.closeDocumentSelector);
  const isDocumentSelectorOpen = useUIStore(state => state.isDocumentSelectorOpen);
  const openSnippetSelector = useUIStore(state => state.openSnippetSelector);
  const closeSnippetSelector = useUIStore(state => state.closeSnippetSelector);
  const isSnippetSelectorOpen = useUIStore(state => state.isSnippetSelectorOpen);
  const initializeBrackets = useUIStore(state => state.initializeBrackets);
  const updateBracketPositions = useUIStore(state => state.updateBracketPositions);
  const handleTabNavigation = useUIStore(state => state.handleTabNavigation);
  const clearBrackets = useUIStore(state => state.clearBrackets);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // I sort of only need this here so we are going to cbbs with usePatientStore
  const [triggerPosition, setTriggerPosition] = useState<number | null>(null);

  // Check if this is a new patient (starts with "new-")
  const isNewPatient = currentPatientId && currentPatientId.startsWith('new-');

  // Fetch current patient data when a patient is selected (but not for new patients)
  const { data: currentPatient, isLoading: isPatientLoading } = useQuery({
    queryKey: ['getPatientbyId', currentPatientId],
    queryFn: async () => {
      const existingPatient = await getPatientById(currentPatientId!);
      return existingPatient;
    },
    enabled: !!currentPatientId && !isNewPatient,
  });

  // For new patients, isPatientLoading should be false
  const actualIsLoading = isNewPatient ? false : isPatientLoading;

  // Load context from backend when patient data is fetched (only for existing patients)
  useEffect(() => {
    if (currentPatient && currentPatient.context && !isNewPatient) {
      console.warn(`Loading patient context from backend: ${currentPatient.context.slice(0, 50)}...`);
      loadContextFromBackend(currentPatient.context);
    }
  }, [currentPatient, loadContextFromBackend, isNewPatient]);

  const formSchema = z.object({
    name: z.string().min(1),
    context: z.string().min(1),
  });
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: isNewPatient ? '' : (currentPatient?.name || ''),
      context: currentPatientContext || '',
    },
  });

  // Update form values when patient or context changes
  useEffect(() => {
    if (isNewPatient) {
      form.setValue('name', '');
    } else if (currentPatient) {
      form.setValue('name', currentPatient.name || '');
    }
  }, [currentPatient, isNewPatient, form]);

  useEffect(() => {
    form.setValue('context', currentPatientContext || '');
  }, [currentPatientContext, form]);

  // Refs to track the previous state of selectors
  const prevIsDocumentSelectorOpenRef = useRef<boolean>(false);
  const prevIsSnippetSelectorOpenRef = useRef<boolean>(false);

  // Effect to refocus textarea when selectors close
  useEffect(() => {
    // If the document selector was previously open and is now closed,
    // and the textarea exists, focus it.
    if (prevIsDocumentSelectorOpenRef.current === true && !isDocumentSelectorOpen) {
      // Use requestAnimationFrame to ensure focus happens after DOM updates
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
    // Update the ref with the current state for the next render.
    prevIsDocumentSelectorOpenRef.current = isDocumentSelectorOpen;
  }, [isDocumentSelectorOpen]);

  useEffect(() => {
    // If the snippet selector was previously open and is now closed,
    // and the textarea exists, focus it.
    if (prevIsSnippetSelectorOpenRef.current === true && !isSnippetSelectorOpen) {
      // Use requestAnimationFrame to ensure focus happens after DOM updates
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
    // Update the ref with the current state for the next render.
    prevIsSnippetSelectorOpenRef.current = isSnippetSelectorOpen;
  }, [isSnippetSelectorOpen]);

  const generateDischargeText = useMutation({
    mutationFn: async ({ context, documentIds }: { context: string; documentIds?: string[] }) => {
      setIsGenerating(true);
      const res = await fetch('/api/discharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: isNewPatient ? null : currentPatientId,
          context,
          documentIds: documentIds || [],
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to generate discharge');
      }
      return res.text();
    },
    onSuccess: (text) => {
      console.warn('Generated discharge summary:', text);
      // TODO: Update discharge summary in the right panel
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const handleContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const cursorPos = e.currentTarget.selectionStart;
    updateCurrentPatientContext(e.target.value);
    form.setValue('context', e.target.value);

    // Update bracket positions if navigation is active
    const isNavigationActive = useUIStore.getState().isBracketNavigationActive;
    if (isNavigationActive && textareaRef.current) {
      updateBracketPositions(textareaRef.current);
    }

    if (isDocumentSelectorOpen) {
      const textFromTrigger = currentPatientContext.substring(triggerPosition || 0, cursorPos);

      if ((!textFromTrigger.startsWith('@'))
        || (textFromTrigger.includes(' ') || textFromTrigger.includes('\n'))) {
        closeDocumentSelector();
      } else if (textareaRef.current) {
        const position = calculateCursorPosition(textareaRef.current, cursorPos);
        openDocumentSelector(position);
      }
    }

    if (isSnippetSelectorOpen) {
      const textFromTrigger = currentPatientContext.substring(triggerPosition || 0, cursorPos);

      if ((!textFromTrigger.startsWith('/'))
        || (textFromTrigger.includes(' ') || textFromTrigger.includes('\n'))) {
        closeSnippetSelector();
      } else if (textareaRef.current) {
        const position = calculateCursorPosition(textareaRef.current, cursorPos);
        openSnippetSelector(position);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle bracket navigation first - pass the textarea element
    if (handleTabNavigation(e, e.currentTarget)) {
      return;
    }

    if (e.key === '@') {
      const cursorPos = e.currentTarget.selectionStart;
      const textBefore = currentPatientContext.substring(0, cursorPos);
      const lastChar = textBefore[textBefore.length - 1];

      if (cursorPos === 0 || lastChar === ' ' || lastChar === '\n') {
        setTriggerPosition(cursorPos);

        setTimeout(() => {
          if (textareaRef.current) {
            const position = calculateCursorPosition(textareaRef.current, cursorPos + 1);
            openDocumentSelector(position);
          }
        }, 0);
      }
    } else if (e.key === '/') {
      const cursorPos = e.currentTarget.selectionStart;
      const textBefore = currentPatientContext.substring(0, cursorPos);
      const lastChar = textBefore[textBefore.length - 1];

      if (cursorPos === 0 || lastChar === ' ' || lastChar === '\n') {
        setTriggerPosition(cursorPos);

        setTimeout(() => {
          if (textareaRef.current) {
            const position = calculateCursorPosition(textareaRef.current, cursorPos + 1);
            openSnippetSelector(position);
          }
        }, 0);
      }
    } else if (e.key === 'Escape') {
      closeDocumentSelector();
      closeSnippetSelector();
      clearBrackets();
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  };

  const handleDocumentSelect = (document: Document) => {
    addDocument(document);

    // Store current cursor position before updating context
    const currentCursorPos = textareaRef.current?.selectionStart || 0;

    // Add document reference to context
    const newContext = `${currentPatientContext}`;
    updateCurrentPatientContext(newContext);
    form.setValue('context', newContext);

    // Close document selector
    closeDocumentSelector();

    // Refocus textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = currentCursorPos;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSnippetSelect = (snippet: Snippet) => {
    // Clear any existing bracket navigation
    clearBrackets();
    // Replace the "/" + any typed text with the snippet content
    const currentCursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeTrigger = currentPatientContext.substring(0, triggerPosition || 0);
    const textAfterCursor = currentPatientContext.substring(currentCursorPos);
    const newContext = textBeforeTrigger + snippet.content + textAfterCursor;

    updateCurrentPatientContext(newContext);
    form.setValue('context', newContext);

    // Close snippet selector
    closeSnippetSelector();

    // Initialize bracket navigation if the snippet has brackets
    if (textareaRef.current && snippet.content.includes('[')) {
      setTimeout(() => {
        if (textareaRef.current) {
          initializeBrackets(textareaRef.current, snippet.content, triggerPosition || 0);
        }
      }, 0);
    } else {
      // Refocus textarea and set cursor position after inserted content if no brackets
      setTimeout(() => {
        textareaRef.current?.focus();
        const newCursorPos = (triggerPosition || 0) + snippet.content.length;
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  if (!currentPatientId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Select a patient from the sidebar to begin</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 flex-1">
      {/* Patient Info Header */}
      {isNewPatient
        ? (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <strong>New Patient</strong>
            </div>
          )
        : currentPatient && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <strong>{currentPatient.name}</strong>
            {actualIsLoading && <span className="ml-2">Loading...</span>}
          </div>
        )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(({ context, name }: FormValues) => {
            if (isNewPatient) {
              // TODO: Create new patient first, then generate discharge
              console.warn('Creating new patient:', name, 'with context:', `${context.slice(0, 50)}...`);
            }
            generateDischargeText.mutate({
              context,
              documentIds: selectedDocuments.map((d: Document) => d.id),
            });
          })}
          className="space-y-6 flex-1 flex flex-col"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field: _field }) => (
              <FormItem>
                <FormLabel>Patient Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter patient name"
                    {..._field}
                    disabled={actualIsLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="context"
            render={({ field: _field }) => (
              <FormItem className="flex-1 flex flex-col">
                <FormLabel>Clinical Context</FormLabel>

                {/* Document Tags */}
                {selectedDocuments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedDocuments.map((doc: Document) => (
                      <div
                        key={doc.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        <span className="truncate max-w-[200px]">{doc.filename}</span>
                        <button
                          type="button"
                          onClick={() => removeDocument(doc.id)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <FormControl>
                  <Textarea
                    ref={textareaRef}
                    placeholder={
                      actualIsLoading
                        ? 'Loading patient data...'
                        : 'Enter clinical notes here... Use @ to add documents and / to add snippets'
                    }
                    className="flex-1 min-h-[400px] resize-none"
                    value={currentPatientContext}
                    onChange={handleContextChange}
                    onKeyDown={handleKeyDown}
                    disabled={actualIsLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={generateDischargeText.isPending || !currentPatientContext.trim() || actualIsLoading}
            className="w-full"
          >
            {generateDischargeText.isPending || isGenerating
              ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                )
              : (
                  'Generate Discharge Summary'
                )}
          </Button>
        </form>
      </Form>

      {/* Document Selector - now controlled by uiStore */}
      <DocumentSelector onSelect={handleDocumentSelect} />

      {/* Snippet Selector - controlled by uiStore */}
      <SnippetSelector onSelect={handleSnippetSelect} />

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          Patient ID:
          {' '}
          {currentPatientId}
          {' '}
          | Context length:
          {' '}
          {currentPatientContext.length}
          {' '}
          |
          Documents:
          {' '}
          {selectedDocuments.length}
          {' '}
          |
          Is new patient:
          {' '}
          {isNewPatient ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
}
