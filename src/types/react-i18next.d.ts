
import 'react-i18next';
import { ReactNode } from 'react';

declare module 'react-i18next' {
  // This makes ReactI18NextChildren properly assignable to ReactNode
  interface ReactI18NextChildren {
    [key: string]: any;
    type?: any;
    props?: any;
    key?: any;
    children?: any;
  }
}
