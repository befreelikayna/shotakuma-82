
import { ReactNode } from 'react';

// Fix for ReactNode to include Record<string, unknown> to address UI component type errors
declare module 'react' {
  // Override the ReactNode type to include Record<string, unknown>
  type ReactNodeOriginal = ReactNode;
  type ReactNode = ReactNodeOriginal | Record<string, unknown>;
}
