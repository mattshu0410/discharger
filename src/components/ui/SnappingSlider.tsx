'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';
import { cn } from '@/libs/utils';

type SnappingSliderProps = {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
};

export function SnappingSlider({
  value,
  onValueChange,
  min = 1,
  max = 14,
  step = 1,
  className,
  disabled = false,
}: SnappingSliderProps) {
  // Handle value changes and snap to whole numbers
  const handleValueChange = (newValue: number[]) => {
    const snappedValue = newValue.map(v => Math.round(v));
    onValueChange(snappedValue);
  };

  return (
    <div className="w-full space-y-4">
      <SliderPrimitive.Root
        value={value}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={cn(
          'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50',
          className,
        )}
      >
        <SliderPrimitive.Track className="bg-muted relative h-2 w-full grow overflow-hidden rounded-full">
          <SliderPrimitive.Range className="bg-primary absolute h-full" />
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb className="border-primary bg-background ring-ring/50 block h-5 w-5 shrink-0 rounded-full border-2 shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>

      {/* Day markers */}
      <div className="relative w-full">
        <div className="flex justify-between text-xs text-muted-foreground">
          {Array.from({ length: max - min + 1 }, (_, i) => {
            const day = min + i;
            const isSelected = value[0] === day;
            return (
              <span
                key={day}
                className={cn(
                  'transition-colors duration-200',
                  isSelected ? 'text-primary font-semibold' : 'text-muted-foreground',
                )}
              >
                {day}
                d
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SnappingSlider;
