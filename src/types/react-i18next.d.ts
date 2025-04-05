
import 'react-i18next';
import { ReactNode } from 'react';

declare module 'react-i18next' {
  // The simplest approach is to extend the React module directly
  // and augment the ReactNode type
  
  // Use a type assertion to make TypeScript accept the Record<string, ReactNode>
  // as a valid ReactNode by declaring ReactI18NextChildren as ReactNode
  type ReactI18NextChildren = ReactNode;
  
  // This tells TypeScript that ReactI18NextChildren can be used anywhere
  // where ReactNode is expected
  declare global {
    namespace React {
      interface ReactNodeArray extends Array<ReactNode> {}
      
      // Augment the ReactNode type definition to include our records
      type ReactNode = 
        | ReactChild
        | ReactFragment
        | ReactPortal
        | boolean
        | null
        | undefined
        | Record<string, ReactNode>;  // Add this to the union
    }
  }
}
