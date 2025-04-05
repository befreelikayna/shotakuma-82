
import 'react-i18next';
import { ReactNode, ReactPortal } from 'react';

declare module 'react-i18next' {
  // Instead of trying to extend ReactNode directly, we'll define it as a valid union type
  // that can be assigned to ReactNode
  interface ReactI18NextChildren {
    // Include all the React node types that ReactNode accepts
    // String, number, boolean literals
    toString?: () => string;
    
    // React elements and fragments
    type?: any;
    props?: any;
    key?: string | number | null;
    children?: ReactNode;
    
    // Function component compatibility
    (): ReactNode;
    
    // Array of React nodes
    map?: (callback: (child: any, index: number) => ReactNode) => ReactNode[];
    
    // Support for usages where it's treated as a record
    [key: string]: any;
  }
}
