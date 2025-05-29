'use client';
import { DischargeSummary } from '@/components/DischargeSummary';
import { PatientForm } from '@/components/PatientForm';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useUIStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

export default function Index() {
  const isContextViewerOpen = useUIStore((state: any) => state.isContextViewerOpen);
  const toggleContextViewer = useUIStore((state: any) => state.toggleContextViewer);
  const contextViewerHeight = useUIStore((state: any) => state.contextViewerHeight);

  return (
    <ResizablePanelGroup direction="vertical" className="h-screen w-full">
      <ResizablePanel defaultSize={isContextViewerOpen ? 70 : 100}>
        {/* Main content */}
        <ResizablePanelGroup direction="horizontal" className="flex-1 flex flex-row bg-background">
          {/* Left: Patient Form */}
          <ResizablePanel defaultSize={50} className="w-1/2 p-8 flex flex-col gap-6 border-r border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Clinical Notes</h2>
              <Button
                variant="outline"
                onClick={toggleContextViewer}
                size="icon"
              >
                {isContextViewerOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <PatientForm />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Right: Discharge Summary */}
          <ResizablePanel defaultSize={50} className="w-1/2 p-8 overflow-y-auto">
            <DischargeSummary />
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
            <div className="flex-1 p-4 overflow-y-auto">
              <p className="text-sm text-muted-foreground">
                Context viewer will show documents and snippets here
              </p>
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
