import React from 'react';
import { colors, typography } from '@/lib/design/tokens';

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  color?: string;
  weight?: 'bold' | 'semibold' | 'medium' | 'normal';
}

const headingSizes = {
  1: typography.fontSize['5xl'],
  2: typography.fontSize['4xl'],
  3: typography.fontSize['3xl'],
  4: typography.fontSize['2xl'],
  5: typography.fontSize.xl,
  6: typography.fontSize.lg,
};

const headingWeights = {
  1: typography.fontWeight.extrabold,
  2: typography.fontWeight.bold,
  3: typography.fontWeight.bold,
  4: typography.fontWeight.semibold,
  5: typography.fontWeight.semibold,
  6: typography.fontWeight.semibold,
};

export function Heading({
  level = 1,
  children,
  className = '',
  color = colors.gray[900],
  weight,
}: HeadingProps) {
  const Tag = `h${level}` as const;
  const fontSize = headingSizes[level];
  const fontWeight = weight ? typography.fontWeight[weight] : headingWeights[level];

  return (
    <Tag
      className={className}
      style={{
        fontSize,
        fontWeight,
        color,
        fontFamily: typography.fontFamily.base,
        lineHeight: typography.lineHeight.tight,
      }}
    >
      {children}
    </Tag>
  );
}

interface ParagraphProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  color?: string;
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}

export function Paragraph({
  children,
  className = '',
  size = 'base',
  color = colors.gray[700],
  weight = 'normal',
}: ParagraphProps) {
  const fontSize = typography.fontSize[size];
  const fontWeight = typography.fontWeight[weight];

  return (
    <p
      className={className}
      style={{
        fontSize,
        fontWeight,
        color,
        fontFamily: typography.fontFamily.base,
        lineHeight: typography.lineHeight.normal,
      }}
    >
      {children}
    </p>
  );
}

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  required?: boolean;
  color?: string;
}

export function Label({ children, className = '', htmlFor, required, color = colors.gray[700] }: LabelProps) {
  return (
    <label
      className={className}
      htmlFor={htmlFor}
      style={{
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color,
        fontFamily: typography.fontFamily.base,
        display: 'block',
      }}
    >
      {children}
      {required && <span style={{ color: colors.error, marginLeft: '4px' }}>*</span>}
    </label>
  );
}

interface TextProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg';
  color?: string;
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  as?: 'span' | 'div' | 'p';
}

export function Text({
  children,
  className = '',
  size = 'base',
  color = colors.gray[600],
  weight = 'normal',
  as = 'span',
}: TextProps) {
  const Component = as as any;
  const fontSize = typography.fontSize[size];
  const fontWeight = typography.fontWeight[weight];

  return (
    <Component
      className={className}
      style={{
        fontSize,
        fontWeight,
        color,
        fontFamily: typography.fontFamily.base,
      }}
    >
      {children}
    </Component>
  );
}
