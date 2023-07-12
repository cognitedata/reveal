import { IconType } from '@cognite/cogs.js';

export type VerticalTab<K extends string = string> = {
  key: K;
  icon: IconType;
  title: string;
};
