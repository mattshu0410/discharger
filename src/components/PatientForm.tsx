'use client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePatientStore } from '@/stores/patientStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getPatientById } from '@/hooks/patients';
import { Loader2, X } from 'lucide-react';
import { DocumentSelector } from '@/components/DocumentSelector';
import { Document } from '@/types';
import { useUIStore } from '@/stores';

export function PatientForm() {
  // Get state from the simplified patient store
  const currentPatientId = usePatientStore((state: any) => state.currentPatientId);
  const currentPatientContext = usePatientStore((state: any) => state.currentPatientContext);
  const updateCurrentPatientContext = usePatientStore((state: any) => state.updateCurrentPatientContext);
  const loadContextFromBackend = usePatientStore((state: any) => state.loadContextFromBackend);
  const isGenerating = usePatientStore((state: any) => state.isGenerating);
  const setIsGenerating = usePatientStore((state: any) => state.setIsGenerating);
  const selectedDocuments = usePatientStore((state: any) => state.selectedDocuments);
  const addDocument = usePatientStore((state: any) => state.addDocument);
  const removeDocument = usePatientStore((state: any) => state.removeDocument);

  // UI state from uiStore
  const openDocumentSelector = useUIStore((state) => state.openDocumentSelector);
  const closeDocumentSelector = useUIStore((state) => state.closeDocumentSelector);
  const isDocumentSelectorOpen = useUIStore((state) => state.isDocumentSelectorOpen);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // I sort of only need this here so we are going to cbbs with usePatientStore
  const [triggerPosition, setTriggerPosition] = useState<number | null>(null);

  // Check if this is a new patient (negative ID)
  const isNewPatient = currentPatientId && currentPatientId < 0;

  // Fetch current patient data when a patient is selected (but not for new patients)
  const { data: currentPatient, isLoading: isPatientLoading } = useQuery({
    queryKey: ['getPatientbyId', currentPatientId],
    queryFn: () => getPatientById(currentPatientId!),
    enabled: !!currentPatientId && !isNewPatient,
  });

  // For new patients, isPatientLoading should be false
  const actualIsLoading = isNewPatient ? false : isPatientLoading;

  // Load context from backend when patient data is fetched (only for existing patients)
  useEffect(() => {
    if (currentPatient && currentPatient.context && !isNewPatient) {
      console.log('Loading patient context from backend:', currentPatient.context.slice(0, 50) + '...');
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

  const generateDischargeText = useMutation({
    mutationFn: async ({ context, documentIds }: { context: string; documentIds?: string[] }) => {
      setIsGenerating(true);
      const res = await fetch('/api/discharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patientId: isNewPatient ? null : currentPatientId,
          context,
          documentIds: documentIds || [] 
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to generate discharge');
      }
      return res.text();
    },
    onSuccess: (text) => {
      console.log('Generated discharge summary:', text);
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
    if (isDocumentSelectorOpen) {
      // Check if we've moved away from the trigger or deleted it
      const textFromTrigger = currentPatientContext.substring(triggerPosition, cursorPos);
      
      // Hide menu if trigger character was deleted or we hit space/enter
      if (!textFromTrigger.startsWith('/') && !textFromTrigger.startsWith('@') || 
          textFromTrigger.includes(' ') || textFromTrigger.includes('\n')) {
        closeDocumentSelector();
      } else if (textareaRef.current) {
        // Update menu position as we type
        const position = calculateCursorPosition(textareaRef.current, cursorPos);
        openDocumentSelector(position);
      }
    }
  };

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
    mirror.style.width = textarea.clientWidth + 'px';
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
    const uniqueId = 'cursor-marker-' + Date.now();
    mirror.innerHTML = textBeforeCursor.replace(/\n/g, '<br>') + `<span id="${uniqueId}"></span>`;
    
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
      y: textareaRect.top + relativeY + window.scrollY
    };
  };

  // This now allows your menu to follow the cursor as you type. Not relevant for @ but for snippets more so. I will leave it here for now.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    
    // Handle @ key for document selector
    if (e.key === '@') {
      //e.preventDefault();
      const cursorPos = e.currentTarget.selectionStart;
      // Check if we're at start of line or after whitespace
      const textBefore = currentPatientContext.substring(0, cursorPos);
      const lastChar = textBefore[textBefore.length - 1];
      
      if (cursorPos === 0 || lastChar === ' ' || lastChar === '\n') {
        setTriggerPosition(cursorPos);
        
        // Calculate position after the character is inserted
        setTimeout(() => {
          if (textareaRef.current) {
            const position = calculateCursorPosition(textareaRef.current, cursorPos + 1);
            openDocumentSelector(position);
          }
      }, 0);
      }
      
    }
    // Handle / key for snippet selector
    else if (e.key === '/') {
      // TODO: Open snippet selector
      console.log('Open snippet selector');
    }
    else if (e.key === 'Escape') {
      closeDocumentSelector();
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleDocumentSelect = (document: Document) => {
    addDocument(document);
    // Store current cursor position before updating context
    const currentCursorPos = textareaRef.current?.selectionStart || 0;
    // Add document reference to context
    const newContext = currentPatientContext + ` @${document.filename} `;
    handleContextChange({ target: { value: newContext } } as React.ChangeEvent<HTMLTextAreaElement>);
    
    // Refocus textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = currentCursorPos + ` @${document.filename} `.length;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  
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
      {isNewPatient ? (
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
          <strong>New Patient</strong>
        </div>
      ) : currentPatient && (
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
              console.log('Creating new patient:', name, 'with context:', context.slice(0, 50) + '...');
            }
            generateDischargeText.mutate({ 
              context,
              documentIds: selectedDocuments.map((d: Document) => d.id) 
            });
          })} 
          className="space-y-6 flex-1 flex flex-col"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter patient name" 
                    {...field}
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
            render={({ field }) => (
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
                        ? "Loading patient data..." 
                        : "Enter clinical notes here... Use @ to add documents and / to add snippets"
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
            {generateDischargeText.isPending || isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Discharge Summary'
            )}
          </Button>
        </form>
      </Form>

      {/* Document Selector - now controlled by uiStore */}
      <DocumentSelector onSelect={handleDocumentSelect} />

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          Patient ID: {currentPatientId} | Context length: {currentPatientContext.length} | 
          Documents: {selectedDocuments.length} |
          Is new patient: {isNewPatient ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
}
