
import 'react-i18next';
import { ReactNode, ReactPortal, ReactElement, Key } from 'react';

declare module 'react-i18next' {
  // Instead of just extending ReactNode with a record type, 
  // we need to create a more specific type that satisfies the compiler
  
  // Make a ReactPortal-compatible type that can be used in places expecting ReactNode
  interface ReactI18NextPortal extends ReactPortal {
    children: ReactNode;
    type: any;
    props: any;
    key: Key | null;
  }
  
  // Define our type as a union that includes ReactNode and our custom portal type
  type ReactI18NextChildren = 
    | ReactNode 
    | (Record<string, ReactNode> & ReactI18NextPortal);
}
