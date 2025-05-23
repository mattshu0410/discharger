'use client';
import { DischargeSummary } from '@/components/DischargeSummary';
import { PatientForm } from '@/components/PatientForm';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export default function Index() {
  return (
    <ResizablePanelGroup direction="vertical" className=" h-screen w-full">
      <ResizablePanel defaultSize={70}>
        {/* Main content */}
        <ResizablePanelGroup direction="horizontal" className="flex-1 flex flex-row bg-background">
          {/* Left: Form */}
          <ResizablePanel defaultSize={50} className="w-1/2 p-8 flex flex-col gap-6 border-r border-border">
            <PatientForm />
          </ResizablePanel>
          <ResizableHandle withHandle />
          {/* Right: Discharge Summary */}
          <ResizablePanel defaultSize={50} className="w-1/2 p-8 overflow-y-auto">
            <DischargeSummary />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30}className="flex flex-col">
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
