
import React from 'react';

// This declaration file is used to fix TypeScript issues with ReactNode compatibility
declare module 'react' {
  // Extend the ReactNode type to handle ReactI18NextChildren
  interface ReactI18NextChildren extends Record<string, unknown> {}
  
  // Make ReactI18NextChildren assignable to ReactNode
  type ReactNode = 
    | ReactElement
    | string
    | number
    | boolean
    | null
    | undefined
    | ReactI18NextChildren
    | Iterable<ReactNode>;
}
