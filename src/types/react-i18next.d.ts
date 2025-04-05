
import 'react-i18next';
import { ReactNode } from 'react';

declare module 'react-i18next' {
  // This ensures ReactI18NextChildren is compatible with ReactNode
  interface ReactI18NextChildren extends ReactNode {
    // Ensure it has all the properties needed to be assignable to ReactNode
    // Adding explicit `type` property to match React internal typings
    [key: string]: any;
  }
}
