
import { ReactNode as OriginalReactNode, ReactElement, ReactFragment, ReactPortal } from 'react';

// Fix for ReactI18NextChildren type issues
declare module 'react' {
  interface ReactI18NextChildren<T = any> extends Record<string, T> {}
  
  // Make ReactNode also accept Record<string, unknown>
  type ReactNode = 
    | OriginalReactNode 
    | ReactElement
    | ReactFragment
    | ReactPortal 
    | boolean
    | null
    | undefined
    | Record<string, unknown>;
    
  // SlotProps type needs to accept ReactI18NextChildren
  namespace Slot {
    interface SlotProps {
      children?: ReactNode;
    }
  }
}
