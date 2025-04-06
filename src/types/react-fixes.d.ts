
import { ReactNode as OriginalReactNode, ReactElement, ReactFragment, ReactPortal } from 'react';

// Fix for ReactI18NextChildren type issues
declare module 'react' {
  // Enhanced ReactNode type to accept Record<string, unknown>
  type ReactNode = 
    | OriginalReactNode 
    | ReactElement
    | ReactFragment
    | ReactPortal 
    | boolean
    | null
    | undefined
    | Record<string, unknown>;
    
  // Extend SlotProps to accept any children
  namespace Slot {
    interface SlotProps {
      children?: any;
    }
  }
}
