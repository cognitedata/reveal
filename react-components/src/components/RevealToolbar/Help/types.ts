import { type ReactElement } from 'react';

export type HelpSectionProps = {
  children: ReactElement;
  title: string;
  description?: string | undefined;
  subTitle?: string | undefined;
};
