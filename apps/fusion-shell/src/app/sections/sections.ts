import images from '../../assets/images';
import { TranslationKeys } from '../../i18n';
import { AppItem, RawAppItem } from '../types';

import { colors } from './colors';
import { RawSection } from './types';

const ARAMCO_CLUSTER_URL = 'api-cdf.sapublichosting.com';
const openshiftClusters = [
  ARAMCO_CLUSTER_URL, // sapc-01, AKA Saudi Aramco
  'openfield.cognitedata.com', // openfield
  'okd-dev-01.cognitedata.com', // okd-dev-01
  'okd-dbre-01.cognitedata.com', // okd-dbre-01
];

const insertTitleAndSubtitleInApps = (
  _t: (key: TranslationKeys) => string,
  apps: RawAppItem[]
) => {
  let appsWithTitleAndSubtitle: AppItem[] = apps.map((item: RawAppItem) => {
    const tagname = _t(`app-${item.internalId}-tagname` as TranslationKeys);
    const title = _t(`app-${item.internalId}-title` as TranslationKeys);
    const subtitle = _t(`app-${item.internalId}-subtitle` as TranslationKeys);

    return {
      ...item,
      tagname,
      title,
      subtitle,
    };
  });

  return appsWithTitleAndSubtitle;
};

export const rawAppsData: RawAppItem[] = [
  {
    category: 'integrate',
    internalId: 'extractors',
    icon: 'Export',
    linkTo: '/extractors',
    importMapApp: '@cognite/cdf-extractor-downloads',
    hideInCluster: openshiftClusters,
    img: images.ExtractorsAppImg,
    ariaLabel: 'Go to Extractors',
  },
  {
    category: 'integrate',
    internalId: 'raw-explorer',
    icon: 'DataTable',
    linkTo: '/raw',
    importMapApp: '@cognite/cdf-raw-explorer',
    img: images.RAWAppImg,
    ariaLabel: 'Go to RAW Explorer',
  },
  {
    category: 'integrate',
    internalId: 'coding-conventions',
    icon: 'Code',
    linkTo: '/coding-conventions',
    importMapApp: '@cognite/cdf-coding-conventions',
    img: images.CodingConventionsAppImg,
    ariaLabel: 'Go to Coding Conventions',
  },
  {
    category: 'integrate',
    internalId: 'transformations',
    icon: 'Refresh',
    linkTo: '/transformations',
    importMapApp: '@cognite/cdf-transformations-2',
    img: images.TransformDataAppImg,
    ariaLabel: 'Go to Transformations',
  },
  {
    category: 'integrate',
    internalId: 'three-d',
    icon: 'Cube',
    linkTo: '/3d-models',
    importMapApp: '@cognite/cdf-3d-management',
    hideInCluster: [ARAMCO_CLUSTER_URL],
    img: images.Upload3DModelsAppImg,
    ariaLabel: 'Go to Upload 3D Models',
  },
  {
    category: 'integrate',
    internalId: 'extpipes',
    icon: 'DataSource',
    linkTo: '/extpipes',
    importMapApp: '@cognite/cdf-integrations-ui',
    hideInCluster: [ARAMCO_CLUSTER_URL],
    img: images.ExtractionPipelinesAppImg,
    ariaLabel: 'Go to Extraction pipelines',
  },
  {
    category: 'integrate',
    internalId: 'flows',
    icon: 'Refresh',
    linkTo: '/flows',
    importMapApp: '@cognite/cdf-flows',
    img: images.FlowsAppImg,
    ariaLabel: 'Go to Extraction pipelines',
  },
  {
    category: 'integrate',
    internalId: 'iot-hub',
    icon: 'Duplicate',
    linkTo: '/iot',
    importMapApp: '@cognite/cdf-iot-hub',
    img: images.IoTDevicesAppImg,
    ariaLabel: 'Go to IoT Hub',
  },
  {
    category: 'contextualize',
    internalId: 'entity-matching',
    icon: 'Share',
    linkTo: '/entity-matching',
    importMapApp: '@cognite/cdf-datastudio',
    img: images.MatchEntitiesAppImg,
    ariaLabel: 'Go to Entity Matching',
  },
  {
    category: 'contextualize',
    internalId: 'pnid',
    icon: 'Assets',
    linkTo: '/interactive-diagrams',
    importMapApp: '@cognite/cdf-context-ui-pnid',
    img: images.InteractiveEDsAppImg,
    ariaLabel: 'Go to PNID',
  },
  {
    category: 'contextualize',
    internalId: 'vision',
    icon: 'Scan',
    linkTo: '/vision/workflow/process',
    importMapApp: '@cognite/cdf-vision-subapp',
    img: images.ContextualizeAppImg,
    ariaLabel: 'Go to Vision',
  },
  {
    category: 'contextualize',
    internalId: 'document-search',
    icon: 'Document',
    linkTo: '/documents',
    importMapApp: '@cognite/cdf-document-search-ui',
    img: images.DocumentClassifierAppImg,
    ariaLabel: 'Go to Document Search',
  },
  {
    category: 'explore',
    internalId: 'data-explorer',
    icon: 'Search',
    linkTo: '/explore',
    importMapApp: '@cognite/cdf-data-exploration',
    img: images.ExplorerAppImg,
    ariaLabel: 'Go to Data Explorer',
  },
  {
    category: 'explore',
    internalId: 'industry-canvas',
    icon: 'Polygon',
    linkTo: '/industrial-canvas',
    importMapApp: '@cognite/cdf-industry-canvas-ui',
    hideInCluster: openshiftClusters,
    img: images.IndustryCanvasAppImg,
    ariaLabel: 'Go to Industrial Canvas',
  },
  {
    category: 'explore',
    internalId: 'charts',
    icon: 'LineChart',
    linkTo: '/charts',
    importMapApp: '@cognite/cdf-charts-ui',
    hideInCluster: openshiftClusters,
    img: images.ChartsAppImg,
    ariaLabel: 'Go to Charts',
  },
  {
    category: 'explore',
    internalId: 'data-catalog',
    icon: 'Grid',
    linkTo: '/data-catalog',
    importMapApp: '@cognite/cdf-data-catalog',
    img: images.DataCatalogAppImg,
    ariaLabel: 'Go to Data Catalog',
  },
  {
    category: 'explore',
    internalId: 'fdm',
    icon: 'Folder',
    linkTo: '/data-models',
    importMapApp: '@cognite/cdf-solutions-ui',
    hideInCluster: openshiftClusters,
    img: images.DataModelingAppImg,
    ariaLabel: 'Go to Data Models',
  },
  {
    category: 'explore',
    internalId: 'functions',
    icon: 'Upload',
    linkTo: '/functions',
    importMapApp: '@cognite/cdf-functions-ui',
    hideInCluster: [
      ...openshiftClusters,
      'aw-was-gp-001.cognitedata.com',
      'orangefield.cognitedata.com',
      'aws-dub-dev.cognitedata.com',
    ],
    img: images.CogniteFunctionsAppImg,
    ariaLabel: 'Go to Cognite Functions',
  },
  {
    category: 'explore',
    internalId: 'notebook',
    icon: 'Python',
    linkTo: '/notebook',
    importMapApp: '@cognite/cdf-ui-notebook',
    img: images.JupyterAppImg,
    ariaLabel: 'Go to Notebook',
  },
  {
    category: 'explore',
    internalId: 'streamlit',
    icon: 'DocumentCode',
    linkTo: '/streamlit-apps',
    importMapApp: '@cognite/cdf-ui-notebook',
    img: images.StreamlitAppImg,
    ariaLabel: 'Go to Streamlit',
  },
  {
    category: 'explore',
    internalId: 'vision-explorer',
    icon: 'Image',
    linkTo: '/vision/explore',
    importMapApp: '@cognite/cdf-vision-subapp',
    hideInCluster: openshiftClusters,
    img: images.ImageAndVideoManagementAppImg,
    ariaLabel: 'Go to Vision explorer',
  },
  {
    category: 'explore',
    internalId: 'simint',
    icon: 'FlowChart',
    linkTo: '/simint',
    importMapApp: '@cognite/cdf-simint-ui',
    hideInCluster: openshiftClusters,
    img: images.AutomateSimulatorsImg,
    ariaLabel: 'Go to SimInt',
  },
  {
    category: 'explore',
    internalId: 'templates',
    icon: 'Duplicate',
    linkTo: '/template-management',
    importMapApp: '@cognite/cdf-templates',
    img: images.TemplateManagementAppImg,
    ariaLabel: 'Go to Template Management',
  },
  {
    category: 'configure',
    internalId: 'access-management',
    icon: 'Users',
    linkTo: '/access-management',
    importMapApp: '@cognite/cdf-access-management',
    img: images.ManageAccessAppImg,
    ariaLabel: 'Go to Access Management',
  },
  {
    category: 'configure',
    internalId: 'dqm',
    icon: 'Timeseries',
    linkTo: '/dqm',
    importMapApp: '@cognite/cdf-ui-dqm',
    img: images.ExtractorsAppImg, // Todo: replace with DQM image
    ariaLabel: 'Go to DQM',
  },
  {
    category: 'configure',
    internalId: 'dashboard-sessions',
    icon: 'Integrations',
    linkTo: '/dashboard-sessions',
    importMapApp: '@cognite/cdf-dashboard-sessions-ui',
    img: images.DashboardSessionsAppImg,
    ariaLabel: 'Go to Dashboard Sessions',
  },
  {
    category: 'configure',
    internalId: 'infield',
    icon: 'Mobile',
    linkTo: '/infield',
    importMapApp: '@cognite/cdf-console',
    hideInCluster: [
      ARAMCO_CLUSTER_URL,
      'openfield.cognitedata.com',
      'okd-dev-01.cognitedata.com',
    ],
    img: images.ConfigureInfieldAppImg,
    ariaLabel: 'Go to InField',
  },
];

export const getAllAppsData = (_t: (key: TranslationKeys) => string) => {
  const appsData = insertTitleAndSubtitleInApps(_t, rawAppsData);

  const sectionIntegrate: RawSection = {
    internalId: 'integrate',
    colors: colors.lightBlue,
    icon: 'DataSource',
    items: appsData.filter((app) => app.category === 'integrate'),
  };

  const sectionContextualize: RawSection = {
    internalId: 'contextualize',
    colors: colors.orange,
    icon: 'Share',
    items: appsData.filter((app) => app.category === 'contextualize'),
  };

  const sectionExploreAndBuild: RawSection = {
    internalId: 'explore',
    colors: colors.purple,
    icon: 'Search',
    items: appsData.filter((app) => app.category === 'explore'),
  };

  const sectionManageAndConfigure: RawSection = {
    internalId: 'configure',
    colors: colors.blue,
    icon: 'Settings',
    items: appsData.filter((app) => app.category === 'configure'),
  };

  const sectionsData: Record<
    'integrate' | 'contextualize' | 'explore' | 'configure',
    RawSection
  > = {
    integrate: sectionIntegrate,
    contextualize: sectionContextualize,
    explore: sectionExploreAndBuild,
    configure: sectionManageAndConfigure,
  };

  return { appsData, sectionsData };
};

export type QuickLink = {
  key: string;
  title: string;
  subtitle: string;
  url: string;
  img: string;
  ariaLabel: string;
};

export type QuickLinks = Record<
  'suggestions' | 'integrate' | 'explore' | 'build' | 'popular' | 'recent',
  string[]
>;

export const getQuickLinks = () => {
  const quickLinks: QuickLinks = {
    suggestions: ['extractors', 'data-explorer', 'charts'],
    integrate: ['extractors', 'raw-explorer', 'transformations'],
    explore: ['data-explorer', 'vision-explorer', 'data-catalog'],
    build: ['charts', 'fdm', 'functions'],
    recent: [],
    popular: ['data-explorer', 'raw-explorer', 'transformations'],
  };

  return { quickLinks };
};

export const getQuickLinksFilter = () => {
  const defaultFilter = ['suggestions', 'integrate', 'explore', 'build'];
  const customFilter = ['recent', 'popular'];

  return { defaultFilter, customFilter };
};
