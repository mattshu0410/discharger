'use client';

import React, { useState } from 'react';
import Counter from '@/components/ui/Counter/Counter';
import SnappingSlider from '@/components/ui/SnappingSlider';

type TimeComparison = {
  emoji: string;
  text: string;
  hours: number;
};

const timeComparisons: TimeComparison[] = [
  { emoji: '🎬', text: 'Quentin Tarantino movie', hours: 2 },
  { emoji: '🎤', text: 'Taylor Swift Concert', hours: 3.5 },
  { emoji: '📺', text: 'One full season of The Office', hours: 7 },
  { emoji: '🧙‍♂️', text: 'Lord of the Rings Marathon', hours: 10 },
  { emoji: '😴', text: 'Perfect weekend sleep-in', hours: 12 },
  { emoji: '🎮', text: 'LoL gaming session', hours: 16 },
  { emoji: '🛀', text: 'Spa weekend getaway', hours: 20 },
  { emoji: '🏖️', text: 'Beach vacation day', hours: 24 },
  { emoji: '🎿', text: 'Ski trip weekend', hours: 30 },
];

export function TimeSavedCalculator() {
  const [days, setDays] = useState([7]); // Default to 7 days

  // Calculate total hours saved: 15 patients * 6 minutes * selected days / 60 minutes
  const totalHours = Math.round((15 * 6 * (days[0] ?? 7)) / 60);

  // Find the best time comparison
  const getTimeComparison = (hours: number): TimeComparison => {
    // Find the closest comparison that's less than or equal to our hours
    const validComparisons = timeComparisons.filter(comp => comp.hours <= hours);
    if (validComparisons.length === 0) {
      return timeComparisons[0]!; // Fallback to shortest
    }
    return validComparisons[validComparisons.length - 1]!; // Get the longest valid one
  };

  const comparison = getTimeComparison(totalHours);
  const comparisonCount = Math.floor(totalHours / comparison.hours);

  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Time Saved Calculator
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          See how much time you'll save by automating discharge summaries
        </p>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Days Slider */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              How many days do you work per week?
            </h3>
            <div className="max-w-md mx-auto">
              <SnappingSlider
                value={days}
                onValueChange={setDays}
                min={1}
                max={14}
                step={1}
              />
            </div>
          </div>

          {/* Hours Counter and Time Comparison Side by Side */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Hours Counter */}
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Hours saved per week
              </h3>
              <div className="flex justify-center">
                <Counter
                  value={totalHours}
                  fontSize={80}
                  places={[100, 10, 1]}
                  textColor="#1f2937" // gray-800
                  fontWeight={900}
                  gradientFrom="transparent"
                  gradientTo="transparent"
                  containerStyle={{
                    backgroundColor: 'transparent',
                    borderRadius: '16px',
                    padding: '24px 32px',
                  }}
                  counterStyle={{ color: '#1f2937' }}
                />
              </div>
            </div>

            {/* Time Comparison */}
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                That's enough time for:
              </h3>
              <div className="bg-gradient-to-r from-primary-100 to-primary-50 rounded-xl p-6">
                <div className="text-4xl mb-2">{comparison.emoji}</div>
                <div className="text-xl font-semibold text-primary-800">
                  {comparisonCount > 1 ? `${comparisonCount} ` : 'One '}
                  {comparisonCount > 1 && comparison.text.toLowerCase().includes('movie')
                    ? comparison.text.replace('movie', 'movies')
                    : comparisonCount > 1 && comparison.text.toLowerCase().includes('concert')
                      ? comparison.text.replace('Concert', 'Concerts')
                      : comparisonCount > 1 && comparison.text.toLowerCase().includes('season')
                        ? comparison.text.replace('One full season', `${comparisonCount} full seasons`)
                        : comparisonCount > 1 && comparison.text.toLowerCase().includes('marathon')
                          ? comparison.text.replace('Marathon', 'Marathons')
                          : comparison.text}
                </div>
              </div>
            </div>
          </div>

          {/* Calculation breakdown */}
          <div className="text-sm text-gray-500 border-t pt-4">
            <p>
              Calculation:
              {' '}
              {days[0] ?? 7}
              {' '}
              day
              {(days[0] ?? 7) > 1 ? 's' : ''}
              {' '}
              × 15 patients × 6 minutes saved =
              {' '}
              {totalHours}
              {' '}
              hours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TimeSavedCalculator;
