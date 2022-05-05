import { ProjectConfigWells } from '@cognite/discover-api-types';

import { WellInspectTabs } from './constants';

type KeyOfType<T, U> = {
  [P in keyof T]-?: T[P] extends U ? P : never;
}[keyof T];

// ndsV2 needs to be removed after everything is done
export type Tab = {
  key: KeyOfType<
    Required<ProjectConfigWells & { ndsV2: { enabled: boolean } }>,
    { enabled?: boolean }
  >;
  name: WellInspectTabs;
  path: string;
  enabled: boolean;
  standalone?: boolean;
  componentToRender: () => JSX.Element;
};
