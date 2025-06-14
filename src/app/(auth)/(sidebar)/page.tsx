'use client';
import { Eye, EyeOff } from 'lucide-react';
import { ContextViewer } from '@/components/ContextViewer';
import { DischargeSummaryPanel } from '@/components/DischargeSummary/DischargeSummaryPanel';
import { PatientForm } from '@/components/PatientForm';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useUIStore } from '@/stores';

export default function Index() {
  const isContextViewerOpen = useUIStore((state: any) => state.isContextViewerOpen);
  const toggleContextViewer = useUIStore((state: any) => state.toggleContextViewer);

  return (
    <ResizablePanelGroup direction="vertical" className="h-full w-full">
      <ResizablePanel defaultSize={isContextViewerOpen ? 70 : 100}>
        {/* Main content */}
        <ResizablePanelGroup direction="horizontal" className="flex-1 flex flex-row bg-background">
          {/* Left: Patient Form */}
          <ResizablePanel defaultSize={50} className="w-1/2 border-r border-border flex flex-col">
            <div className="flex items-center justify-between p-8 pb-4">
              <h2 className="text-lg font-semibold">Clinical Notes</h2>
              <Button
                variant="outline"
                onClick={toggleContextViewer}
                size="icon"
              >
                {isContextViewerOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <PatientForm />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right: Discharge Summary */}
          <ResizablePanel defaultSize={50} className="w-1/2">
            <DischargeSummaryPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>

      {/* Context Viewer Panel */}
      {isContextViewerOpen && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={30}
            className="flex flex-col border-t bg-muted/50"
          >
            <div className="p-4 border-b">
              <h3 className="font-semibold">Context Sources</h3>
              <p className="text-sm text-muted-foreground">
                Documents and snippets used in this patient's context
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ContextViewer />
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
