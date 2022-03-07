import navigation from 'constants/navigation';
import { WellConfig } from 'tenants/types';

import { TAB_NAMES, WellInspectTabs } from './constants';

type KeyOfType<T, U> = {
  [P in keyof T]-?: T[P] extends U ? P : never;
}[keyof T];

type Tab = {
  key: KeyOfType<Required<WellConfig>, { enabled?: boolean }>;
  name: WellInspectTabs;
  path: string;
  standalone?: boolean;
};

export const TAB_ITEMS: Tab[] = [
  {
    key: 'overview',
    name: TAB_NAMES.OVERVIEW,
    path: navigation.SEARCH_WELLS_INSPECT_OVERVIEW,
  },
  {
    key: 'trajectory',
    name: TAB_NAMES.TRAJECTORIES,
    path: navigation.SEARCH_WELLS_INSPECT_TRAJECTORY,
  },
  {
    key: 'nds',
    name: TAB_NAMES.NDS_EVENTS,
    path: navigation.SEARCH_WELLS_INSPECT_EVENTSNDS,
  },
  {
    key: 'npt',
    name: TAB_NAMES.NPT_EVENTS,
    path: navigation.SEARCH_WELLS_INSPECT_EVENTSNPT,
  },
  {
    key: 'casing',
    name: TAB_NAMES.CASINGS,
    path: navigation.SEARCH_WELLS_INSPECT_CASINGSCOMPLETIONS,
  },
  {
    key: 'logs',
    name: TAB_NAMES.WELL_LOGS,
    path: navigation.SEARCH_WELLS_INSPECT_LOGTYPE,
  },
  {
    key: 'relatedDocument',
    name: TAB_NAMES.RELATED_DOCUMENTS,
    path: navigation.SEARCH_WELLS_INSPECT_RELATEDDOCUMENTS,
  },
  {
    key: 'digitalRocks',
    name: TAB_NAMES.DIGITAL_ROCKS,
    path: navigation.SEARCH_WELLS_INSPECT_DIGITALROCKS,
  },
  {
    key: 'measurements',
    name: TAB_NAMES.GEOMECHANICS_PPFG,
    path: navigation.SEARCH_WELLS_INSPECT_MEASUREMENTS,
  },
  {
    key: 'threeDee',
    name: TAB_NAMES.THREE_DEE,
    path: navigation.SEARCH_WELLS_INSPECT_THREEDEE,
    standalone: true,
  },
];
