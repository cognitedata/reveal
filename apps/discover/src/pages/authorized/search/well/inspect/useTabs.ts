import navigation from 'constants/navigation';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';

import { TAB_NAMES } from './constants';
import ThreeDee from './modules/3d';
import Casing from './modules/casings';
import DigitalRocks from './modules/digitalRocks';
import GeomechanicsAndPPFG from './modules/geomechanicsAndPPFG';
import NdsEvents from './modules/ndsEvents';
import NptEvents from './modules/nptEvents';
import Overview from './modules/overview';
import RelatedDocument from './modules/relatedDocument';
import StickChart from './modules/stickChart';
import Trajectory from './modules/trajectory';
import WellLogs from './modules/wellLogs';
import { Tab } from './types';

export const useTabs = () => {
  const { data: wellsConfig } = useWellConfig();

  const TAB_ITEMS: Tab[] = [
    {
      key: 'overview',
      name: TAB_NAMES.OVERVIEW,
      path: navigation.SEARCH_WELLS_INSPECT_OVERVIEW,
      componentToRender: Overview,
      enabled: !!wellsConfig?.overview?.enabled,
    },
    {
      key: 'stickChart',
      name: TAB_NAMES.STICK_CHART,
      path: navigation.SEARCH_WELLS_INSPECT_STICK_CHART,
      componentToRender: StickChart,
      enabled: true,
    },
    {
      key: 'trajectory',
      name: TAB_NAMES.TRAJECTORIES,
      path: navigation.SEARCH_WELLS_INSPECT_TRAJECTORY,
      componentToRender: Trajectory,
      enabled: !!wellsConfig?.trajectory?.enabled,
    },
    {
      key: 'nds',
      name: TAB_NAMES.NDS_EVENTS,
      path: navigation.SEARCH_WELLS_INSPECT_EVENTSNDS,
      componentToRender: NdsEvents,
      enabled: !!wellsConfig?.nds?.enabled,
    },
    {
      key: 'npt',
      name: TAB_NAMES.NPT_EVENTS,
      path: navigation.SEARCH_WELLS_INSPECT_EVENTSNPT,
      componentToRender: NptEvents,
      enabled: !!wellsConfig?.npt?.enabled,
    },
    {
      key: 'casing',
      name: TAB_NAMES.CASINGS,
      path: navigation.SEARCH_WELLS_INSPECT_CASINGSCOMPLETIONS,
      componentToRender: Casing,
      enabled: !!wellsConfig?.casing?.enabled,
    },
    {
      key: 'logs',
      name: TAB_NAMES.WELL_LOGS,
      path: navigation.SEARCH_WELLS_INSPECT_LOGTYPE,
      componentToRender: WellLogs,
      enabled: !!wellsConfig?.logs?.enabled,
    },
    {
      key: 'relatedDocument',
      name: TAB_NAMES.RELATED_DOCUMENTS,
      path: navigation.SEARCH_WELLS_INSPECT_RELATEDDOCUMENTS,
      componentToRender: RelatedDocument,
      enabled: !!wellsConfig?.relatedDocument?.enabled,
    },
    {
      key: 'digitalRocks',
      name: TAB_NAMES.DIGITAL_ROCKS,
      path: navigation.SEARCH_WELLS_INSPECT_DIGITALROCKS,
      componentToRender: DigitalRocks,
      enabled: !!wellsConfig?.digitalRocks?.enabled,
    },
    {
      key: 'measurements',
      name: TAB_NAMES.GEOMECHANICS_PPFG,
      path: navigation.SEARCH_WELLS_INSPECT_MEASUREMENTS,
      componentToRender: GeomechanicsAndPPFG,
      enabled: !!wellsConfig?.measurements?.enabled,
    },
    {
      key: 'threeDee',
      name: TAB_NAMES.THREE_DEE,
      path: navigation.SEARCH_WELLS_INSPECT_THREEDEE,
      componentToRender: ThreeDee,
      standalone: true,
      enabled: !!wellsConfig?.threeDee?.enabled,
    },
  ];

  return TAB_ITEMS.filter((tab) => tab.enabled);
};
