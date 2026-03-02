import React from 'react';
import { colors, spacing, borderRadius, shadows } from '@/lib/design/tokens';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined';
  padding?: string;
}

export function Card({
  children,
  className = '',
  variant = 'default',
  padding = spacing[6],
}: CardProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: colors.white,
        borderRadius: borderRadius['2xl'],
        padding,
        border: variant === 'outlined' ? `1px solid ${colors.gray[200]}` : 'none',
        boxShadow: variant === 'default' ? shadows.lg : shadows.none,
      }}
    >
      {children}
    </div>
  );
}

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const containerMaxWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
};

export function Container({
  children,
  className = '',
  maxWidth = 'lg',
}: ContainerProps) {
  return (
    <div
      className={className}
      style={{
        maxWidth: containerMaxWidths[maxWidth],
        margin: '0 auto',
        padding: `0 ${spacing[4]}`,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}

interface FlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'column';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch';
  gap?: string;
  wrap?: boolean;
}

const justifyMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

const alignMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

export function Flex({
  children,
  className = '',
  direction = 'row',
  justify = 'start',
  align = 'start',
  gap = spacing[4],
  wrap = false,
}: FlexProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: direction as any,
        justifyContent: justifyMap[justify],
        alignItems: alignMap[align],
        gap,
        flexWrap: wrap ? 'wrap' : 'nowrap',
      }}
    >
      {children}
    </div>
  );
}

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: string;
}

export function Grid({
  children,
  className = '',
  cols = 1,
  gap = spacing[4],
}: GridProps) {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap,
      }}
    >
      {children}
    </div>
  );
}

interface AlertProps {
  children: React.ReactNode;
  className?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

const alertColors = {
  success: { bg: '#ECFDF5', border: '#10B981', text: '#047857' },
  error: { bg: '#FEF2F2', border: '#EF4444', text: '#7F1D1D' },
  warning: { bg: '#FFFBEB', border: '#F59E0B', text: '#78350F' },
  info: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
};

export function Alert({
  children,
  className = '',
  type = 'info',
}: AlertProps) {
  const style = alertColors[type];

  return (
    <div
      className={className}
      style={{
        backgroundColor: style.bg,
        borderLeft: `4px solid ${style.border}`,
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        color: style.text,
      }}
    >
      {children}
    </div>
  );
}
