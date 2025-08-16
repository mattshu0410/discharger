'use client';

import React, { useEffect, useRef, useState } from 'react';

const funnyQuotes = [
  '☕ On 6 red bulls',
  '💉 10 caffeine shots in',
  '😴 Running on fumes',
  '⚡ Powered by coffee',
  '🌙 Sleep is overrated',
  '🏥 Surviving residency',
  '⏰ One more shift',
  '☕ Coffee IV drip needed',
];

type Position = {
  x: number;
  y: number;
};

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [currentQuote, setCurrentQuote] = useState(funnyQuotes[0]);
  const [isVisible, setIsVisible] = useState(false);
  const [velocity, setVelocity] = useState<Position>({ x: 0, y: 0 });
  const [wiggleOffset, setWiggleOffset] = useState<Position>({ x: 0, y: 0 });
  const lastPosition = useRef<Position>({ x: 0, y: 0 });
  const animationRef = useRef<number | undefined>(undefined);

  // Track mouse movement and calculate velocity
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };

      // Calculate velocity for physics effect
      const newVelocity = {
        x: newPosition.x - lastPosition.current.x,
        y: newPosition.y - lastPosition.current.y,
      };

      setMousePosition(newPosition);
      setVelocity(newVelocity);
      setIsVisible(true);

      lastPosition.current = newPosition;
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Physics-based wiggle animation
  useEffect(() => {
    const animate = () => {
      setWiggleOffset(prev => ({
        x: prev.x * 0.9 + velocity.x * 0.1,
        y: prev.y * 0.9 + velocity.y * 0.1,
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [velocity]);

  // Rotate quotes every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => {
        const currentIndex = funnyQuotes.indexOf(prev || funnyQuotes[0]!);
        const nextIndex = (currentIndex + 1) % funnyQuotes.length;
        return funnyQuotes[nextIndex]!;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed pointer-events-none z-50 transition-opacity duration-200"
      style={{
        left: mousePosition.x + wiggleOffset.x * 0.2 + 15,
        top: mousePosition.y + wiggleOffset.y * 0.2 - 10,
        transform: `rotate(${wiggleOffset.x * 0.1}deg)`,
      }}
    >
      {/* Quote box without arrow */}
      <div
        className="bg-primary-600 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg"
        style={{
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
        }}
      >
        {currentQuote}
      </div>
    </div>
  );
}

export default CustomCursor;
