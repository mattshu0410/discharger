'use client';

import { ArrowRight } from 'lucide-react';
import React, { useState } from 'react';
import { DischargeSummarySection } from '@/components/DischargeSummary/DischargeSummarySection';
import { Button } from '@/components/ui/button';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import { Textarea } from '@/components/ui/textarea';
import { DUMMY_ED_NOTE, LOADING_MESSAGES, mockDischargeSummary } from '@/data/mockDischargeData';

type DemoState = 'initial' | 'loading' | 'complete';

export function DemoSection() {
  const [demoState, setDemoState] = useState<DemoState>('initial');
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(LOADING_MESSAGES[0]);

  const handleGenerateDemo = () => {
    setDemoState('loading');

    // Cycle through loading messages
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setCurrentLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 800);

    // Complete after 3 seconds
    setTimeout(() => {
      clearInterval(messageInterval);
      setDemoState('complete');
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto h-full">
      {/* Show Input or Loading */}
      {demoState === 'initial' && (
        <div className="h-full flex flex-col gap-4 pb-20 min-h-0">
          <div className="relative flex-1 min-h-0">
            <Textarea
              value={DUMMY_ED_NOTE}
              readOnly
              className="h-full w-full font-mono text-sm !bg-white border-2 border-dashed border-gray-300 resize-none hide-scrollbar text-gray-900"
              placeholder="Paste your clinical notes here..."
            />
            <div className="absolute top-3 right-3 bg-gray-800 text-white px-2 py-1 rounded text-xs">
              Example ED Note
            </div>
          </div>

          <div className="flex-shrink-0">
            <Button
              onClick={handleGenerateDemo}
              size="lg"
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white"
            >
              Generate Discharge
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {demoState === 'loading' && (
        <div className="h-full">
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <LoadingAnimation width={100} height={100} className="mb-4" />
            <p className="font-medium text-lg">{currentLoadingMessage}</p>
            <div className="flex items-center mt-2">
              <div className="flex space-x-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show Generated Output with fade at bottom */}
      {demoState === 'complete' && (
        <div className="h-full relative">
          <div className="h-full overflow-hidden">
            <div className="p-4 space-y-4 h-full overflow-y-auto hide-scrollbar text-gray-900 [&>*:hover]:bg-primary-500/5">
              {mockDischargeSummary.sections.map(section => (
                <DischargeSummarySection key={section.id} section={section} />
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default DemoSection;
