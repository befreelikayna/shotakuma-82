
import 'react-i18next';
import { ReactNode } from 'react';

declare module 'react-i18next' {
  // This declares that TFuncReturn can be used anywhere ReactNode is expected
  type ReactI18NextChildren = ReactNode | Record<string, ReactNode>;
}
