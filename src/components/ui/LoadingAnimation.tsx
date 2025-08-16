'use client';

import React from 'react';
import LottieLoader from 'react-lottie-loader';
import doctorAnimationData from '../../../public/assets/images/3D Doctor Dancing.json';

type LoadingAnimationProps = {
  width?: number;
  height?: number;
  className?: string;
};

export function LoadingAnimation({
  width = 120,
  height = 120,
  className = '',
}: LoadingAnimationProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <LottieLoader
        animationData={doctorAnimationData}
        style={{ width, height }}
      />
    </div>
  );
}

export default LoadingAnimation;
