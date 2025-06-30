'use client';

import type { ReactNode } from 'react';
import { Monitor, Smartphone, Tablet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IPhone14Frame } from './iPhone14Frame';

type DevicePreviewProps = {
  children: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  deviceType?: 'phone' | 'tablet' | 'desktop';
  variant?: 'silver' | 'graphite' | 'gold' | 'purple';
  floatingElements?: ReactNode;
};

export function DevicePreview({
  children,
  onClose,
  showCloseButton = true,
  deviceType = 'phone',
  variant = 'graphite',
  floatingElements,
}: DevicePreviewProps) {
  const renderDeviceFrame = () => {
    switch (deviceType) {
      case 'phone':
        return (
          <IPhone14Frame className="h-full flex flex-col" variant={variant} floatingElements={floatingElements}>
            {children}
          </IPhone14Frame>
        );
      case 'tablet':
        // Could add iPad frame here in the future
        return (
          <div className="w-[768px] h-[1024px] bg-gray-800 rounded-3xl p-4 shadow-2xl">
            <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
              {children}
            </div>
          </div>
        );
      case 'desktop':
        // Could add desktop frame here in the future
        return (
          <div className="w-[1200px] h-[800px] bg-gray-900 rounded-lg p-2 shadow-2xl">
            <div className="w-full h-8 bg-gray-700 rounded-t-lg flex items-center px-3 gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div className="w-full h-[calc(100%-2rem)] bg-white overflow-hidden">
              {children}
            </div>
          </div>
        );
      default:
        return children;
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Controls Header */}
      <div className="flex items-center justify-between w-full p-4 bg-slate-800/90">
        <div className="flex items-center gap-2 text-white">
          <div className="flex bg-white/10 rounded-lg p-1">
            <Button
              variant={deviceType === 'phone' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => { /* Could add device switching */ }}
              className="text-white hover:bg-white/20"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceType === 'tablet' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => { /* Could add device switching */ }}
              className="text-white hover:bg-white/20"
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceType === 'desktop' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => { /* Could add device switching */ }}
              className="text-white hover:bg-white/20"
            >
              <Monitor className="w-4 h-4" />
            </Button>
          </div>
          <span className="text-sm font-medium">Device Preview</span>
        </div>

        {showCloseButton && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
            Close Preview
          </Button>
        )}
      </div>

      {/* Device Frame */}
      <div className="flex-1 flex flex-col h-full items-center justify-center">
        {renderDeviceFrame()}
      </div>
    </div>
  );
}
