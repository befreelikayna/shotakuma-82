
import { ReactNode } from 'react';

// Fix for ReactI18NextChildren type issues
declare module 'react' {
  interface ReactI18NextChildren {
    // This extends ReactNode to be compatible with any additional properties
    [key: string]: unknown;
  }
}

// Make ReactNode also accept Record<string, unknown> to fix UI component type errors
declare module 'react' {
  // This needs to be properly defined to avoid recursive type reference
  type FixedReactNode = ReactNode | Record<string, unknown>;
}
