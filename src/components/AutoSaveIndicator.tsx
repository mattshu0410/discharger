'use client';
import { usePatientStore } from '@/stores/patientStore';
import { AlertCircle, Check, Loader2 } from 'lucide-react';

export function AutoSaveIndicator() {
  const saveStatus = usePatientStore(state => state.saveStatus);
  const saveError = usePatientStore(state => state.saveError);
  const lastSaved = usePatientStore(state => state.lastSaved);

  if (saveStatus === 'idle') {
    return null;
  }

  const formatLastSaved = (date: Date | null) => {
    if (!date) {
      return '';
    }
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {saveStatus === 'saving' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {saveStatus === 'saved' && (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span>
            Saved
            {' '}
            {formatLastSaved(lastSaved)}
          </span>
        </>
      )}
      {saveStatus === 'error' && (
        <>
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-destructive" title={saveError || 'Save failed'}>
            Save failed
          </span>
        </>
      )}
    </div>
  );
}
