import React from 'react';
import { colors, typography, spacing, borderRadius, transitions } from '@/lib/design/tokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const buttonVariants = {
  primary: {
    backgroundColor: colors.primary,
    color: colors.white,
    hover: colors.primaryDark,
  },
  secondary: {
    backgroundColor: colors.secondary,
    color: colors.white,
    hover: colors.secondaryDark,
  },
  danger: {
    backgroundColor: colors.error,
    color: colors.white,
    hover: '#DC2626',
  },
  ghost: {
    backgroundColor: colors.gray[100],
    color: colors.gray[900],
    hover: colors.gray[200],
  },
};

const buttonSizes = {
  sm: {
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: typography.fontSize.sm,
  },
  md: {
    padding: `${spacing[3]} ${spacing[4]}`,
    fontSize: typography.fontSize.base,
  },
  lg: {
    padding: `${spacing[4]} ${spacing[6]}`,
    fontSize: typography.fontSize.lg,
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  fullWidth,
  style,
  ...props
}: ButtonProps) {
  const variantStyle = buttonVariants[variant];
  const sizeStyle = buttonSizes[size];

  return (
    <button
      style={{
        ...sizeStyle,
        backgroundColor: variantStyle.backgroundColor,
        color: variantStyle.color,
        border: 'none',
        borderRadius: borderRadius.lg,
        fontWeight: typography.fontWeight.semibold,
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.6 : 1,
        transition: transitions.bgColor,
        width: fullWidth ? '100%' : 'auto',
        fontFamily: typography.fontFamily.base,
        ...style,
      }}
      disabled={isLoading}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = variantStyle.hover;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = variantStyle.backgroundColor;
      }}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

const inputSizes = {
  sm: {
    padding: `${spacing[2]} ${spacing[2]}`,
    fontSize: typography.fontSize.sm,
  },
  md: {
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: typography.fontSize.base,
  },
  lg: {
    padding: `${spacing[3]} ${spacing[4]}`,
    fontSize: typography.fontSize.lg,
  },
};

export function Input({
  label,
  error,
  size = 'md',
  style,
  ...props
}: InputProps) {
  const sizeStyle = inputSizes[size];

  return (
    <div style={{ marginBottom: spacing[4] }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.gray[700],
            marginBottom: spacing[2],
            fontFamily: typography.fontFamily.base,
          }}
        >
          {label}
          {props.required && <span style={{ color: colors.error }}>*</span>}
        </label>
      )}
      <input
        style={{
          ...sizeStyle,
          width: '100%',
          border: `1px solid ${error ? colors.error : colors.gray[300]}`,
          borderRadius: borderRadius.lg,
          fontFamily: typography.fontFamily.base,
          transition: transitions.base,
          boxSizing: 'border-box',
          ...style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? colors.error : colors.primary;
          e.target.style.outline = 'none';
          e.target.style.boxShadow = `0 0 0 3px ${error ? colors.errorLight : 'rgba(124, 58, 237, 0.1)'}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? colors.error : colors.gray[300];
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && (
        <span
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.error,
            marginTop: spacing[1],
            display: 'block',
            fontFamily: typography.fontFamily.base,
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
