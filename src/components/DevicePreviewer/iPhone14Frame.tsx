'use client';

import type { ReactNode } from 'react';
import styles from './device-styles.module.css';

type IPhone14FrameProps = {
  children: ReactNode;
  variant?: 'silver' | 'graphite' | 'gold' | 'purple';
  className?: string;
  showStatusBar?: boolean;
  showHomeIndicator?: boolean;
  floatingElements?: ReactNode;
};

export function IPhone14Frame({
  children,
  variant = 'graphite',
  className = '',
  showStatusBar = true,
  showHomeIndicator = true,
  floatingElements,
}: IPhone14FrameProps) {
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className={`${styles.deviceContainer} ${className}`}>
      <div className={`${styles.deviceIPhone14} ${styles[variant]}`}>
        <div className={styles.deviceFrame}>
          {/* Dynamic Island */}
          <div className={styles.deviceNotch} />

          {/* Status Bar */}
          {showStatusBar && (
            <div className={styles.deviceStatusBar}>
              <div className={styles.deviceTime} suppressHydrationWarning>
                {getCurrentTime()}
              </div>
              <div className={styles.deviceBattery}>
                <span>100%</span>
                <div style={{
                  width: '24px',
                  height: '12px',
                  border: '1px solid currentColor',
                  borderRadius: '2px',
                  position: 'relative',
                }}
                >
                  <div style={{
                    width: '20px',
                    height: '8px',
                    background: 'currentColor',
                    margin: '1px',
                    borderRadius: '1px',
                  }}
                  />
                  <div style={{
                    position: 'absolute',
                    right: '-3px',
                    top: '4px',
                    width: '2px',
                    height: '4px',
                    background: 'currentColor',
                    borderRadius: '0 1px 1px 0',
                  }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Device Screen */}
          <div className={styles.deviceScreen}>
            <div className={styles.deviceContent}>
              {children}
            </div>
            {/* Floating elements positioned relative to device screen, not scrollable content */}
            {floatingElements}
          </div>

          {/* Home Indicator */}
          {showHomeIndicator && (
            <div className={styles.deviceHomeIndicator} />
          )}

          {/* Side Buttons */}
          <div className={styles.deviceBtns} />

          {/* Power Button */}
          <div className={styles.devicePower} />
        </div>
      </div>
    </div>
  );
}
