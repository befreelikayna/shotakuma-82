
import { ReactNode } from 'react';

// Fix for ReactI18NextChildren type issues
declare module 'react' {
  interface ReactI18NextChildren<P = unknown> {
    children?: ReactNode | undefined;
    [key: string]: unknown;
  }
}

// Make ReactNode also accept Record<string, unknown> to fix UI component type errors
declare module 'react' {
  // Override the ReactNode type to include Record<string, unknown>
  type ReactNodeOriginal = ReactNode;
  type ReactNode = ReactNodeOriginal | Record<string, unknown>;
}
