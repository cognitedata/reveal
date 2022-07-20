import { ProjectConfigWells } from '@cognite/discover-api-types';

import { WellInspectTabs } from './constants';

type KeyOfType<T, U> = {
  [P in keyof T]-?: T[P] extends U ? P : never;
}[keyof T];

export type Tab = {
  key: KeyOfType<
    Required<ProjectConfigWells & { stickChart: { enabled: boolean } }>,
    { enabled?: boolean }
  >;
  name: WellInspectTabs;
  path: string;
  enabled: boolean;
  standalone?: boolean;
  componentToRender: () => JSX.Element;
};
