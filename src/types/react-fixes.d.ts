
import { ReactNode } from 'react';

// Fix for ReactI18NextChildren type issues
declare module 'react' {
  interface ReactI18NextChildren extends ReactNode {
    // This extends ReactNode to be compatible with any additional properties
    [key: string]: unknown;
  }
}

// Make ReactNode also accept Record<string, unknown> to fix UI component type errors
declare module 'react' {
  type ReactNode = ReactNode | Record<string, unknown>;
}
