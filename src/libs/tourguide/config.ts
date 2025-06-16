import type { TourGuideOptions } from '@sjmc11/tourguidejs/src/core/options';
import type { TourGuideStep } from '@sjmc11/tourguidejs/src/types/TourGuideStep';

export const tourOptions: TourGuideOptions = {
  autoScroll: true,
  autoScrollSmooth: true,
  autoScrollOffset: 100,
  backdropAnimate: true,
  backdropColor: 'rgba(0, 0, 0, 0.5)',
  targetPadding: 10,
  dialogClass: 'tourguide-dialog',
  dialogAnimate: true,
  dialogWidth: 380,
  dialogMaxWidth: 500,
  nextLabel: 'Next',
  prevLabel: 'Back',
  finishLabel: 'Get Started',
  completeOnFinish: true,
  keyboardControls: true,
  exitOnEscape: false, // Don't allow escape to prevent accidental exits
  exitOnClickOutside: false, // Don't allow backdrop clicks to prevent accidental exits
  showStepDots: true,
  stepDotsPlacement: 'footer',
  showButtons: true,
  showStepProgress: true,
  progressBar: 'rgba(59, 130, 246, 0.8)', // Blue color matching the app theme
  closeButton: true,
  rememberStep: true,
  debug: false,
};

export const tourSteps: TourGuideStep[] = [
  {
    title: 'Welcome to Discharger! 🏥',
    content: `
      <div class="space-y-2">
        <p>Discharger helps you create comprehensive, citation-backed discharge summaries using AI.</p>
        <p class="text-sm text-muted-foreground">Let's take a quick tour of the main features.</p>
      </div>
    `,
    order: 1,
    group: 'onboarding',
  },
  {
    title: 'Patient Selection',
    content: `
      <div class="space-y-2">
        <p>Start by selecting or creating a patient from the sidebar.</p>
        <p class="text-sm text-muted-foreground">You can manage multiple patients and switch between them easily.</p>
      </div>
    `,
    target: '[data-tour="patient-list"]',
    order: 2,
    group: 'onboarding',
  },
  {
    title: 'Patient Context',
    content: `
      <div class="space-y-2">
        <p>Paste or type patient notes here. This is where you input all relevant medical information.</p>
        <p class="text-sm text-muted-foreground">Don't worry about saving - it auto-saves as you type!</p>
      </div>
    `,
    target: '[data-tour="patient-context"]',
    order: 3,
    group: 'onboarding',
  },
  {
    title: 'Add Medical Documents',
    content: `
      <div class="space-y-2">
        <p>Type <code class="px-1 py-0.5 bg-muted rounded text-sm">@</code> to search and add medical guidelines.</p>
        <p class="text-sm text-muted-foreground">These documents provide evidence-based context for your discharge summary.</p>
      </div>
    `,
    target: '[data-tour="patient-context"]',
    order: 4,
    group: 'onboarding',
  },
  {
    title: 'Insert Snippets',
    content: `
      <div class="space-y-2">
        <p>Type <code class="px-1 py-0.5 bg-muted rounded text-sm">/</code> to insert pre-defined text snippets.</p>
        <p class="text-sm text-muted-foreground">Great for commonly used phrases and instructions.</p>
      </div>
    `,
    target: '[data-tour="patient-context"]',
    order: 5,
    group: 'onboarding',
  },
  {
    title: 'Generate Discharge Summary',
    content: `
      <div class="space-y-2">
        <p>Click this button to generate an AI-powered discharge summary.</p>
        <p class="text-sm text-muted-foreground">The AI will use your patient notes and selected documents to create a comprehensive summary.</p>
      </div>
    `,
    target: '[data-tour="generate-discharge"]',
    order: 6,
    group: 'onboarding',
  },
  {
    title: 'Discharge Summary',
    content: `
      <div class="space-y-2">
        <p>Your generated discharge summary appears here with organized sections.</p>
        <p class="text-sm text-muted-foreground">Each section has a copy button for easy transfer to your EMR.</p>
      </div>
    `,
    target: '[data-tour="discharge-summary"]',
    order: 7,
    group: 'onboarding',
  },
  {
    title: 'Provide Feedback',
    content: `
      <div class="space-y-2">
        <p>Not happy with a section? Provide feedback here to regenerate it.</p>
        <p class="text-sm text-muted-foreground">Your feedback can be saved as rules for future summaries.</p>
      </div>
    `,
    target: '[data-tour="discharge-feedback"]',
    order: 8,
    group: 'onboarding',
  },
  {
    title: 'Context & Citations',
    content: `
      <div class="space-y-2">
        <p>View source documents and citations that support the discharge summary.</p>
        <p class="text-sm text-muted-foreground">Click on citations to see the exact source text.</p>
      </div>
    `,
    target: '[data-tour="context-viewer"]',
    order: 9,
    group: 'onboarding',
  },
  {
    title: 'Upload Medical Guidelines',
    content: `
      <div class="space-y-2">
        <p>Visit the Memory page to upload your own medical guidelines and protocols.</p>
        <p class="text-sm text-muted-foreground">These documents will be available for all your discharge summaries.</p>
      </div>
    `,
    target: '[data-tour="memory-link"]',
    order: 10,
    group: 'onboarding',
  },
  {
    title: 'You\'re All Set! 🎉',
    content: `
      <div class="space-y-2">
        <p>That's it! You're ready to start creating discharge summaries.</p>
        <p class="text-sm text-muted-foreground">You can always replay this tour from your profile settings.</p>
      </div>
    `,
    order: 11,
    group: 'onboarding',
  },
];
