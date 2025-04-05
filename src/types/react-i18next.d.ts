
import 'react-i18next';
import { ReactNode } from 'react';

declare module 'react-i18next' {
  // This is needed to make ReactI18NextChildren compatible with ReactNode
  interface ReactI18NextChildren extends ReactNode {}
}
