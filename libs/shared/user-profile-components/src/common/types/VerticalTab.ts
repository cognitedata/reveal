import { IconType } from '@cognite/cogs.js';

export type VerticalTab = {
  key: string;
  icon: IconType;
  title: string;
  content: React.ReactNode;
};
