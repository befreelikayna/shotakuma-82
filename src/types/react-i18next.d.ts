
import 'react-i18next';
import { ReactNode, ReactPortal } from 'react';

declare module 'react-i18next' {
  // Make ReactI18NextChildren properly extend ReactNode with all necessary properties
  interface ReactI18NextChildren extends ReactNode {
    // Add specific properties from ReactPortal
    type?: any;
    props?: any;
    key?: any;
    children?: ReactNode;
    
    // Ensure compatibility with Record<string, unknown> format
    [key: string]: any;
  }
}
