export type Application = {
  name: string;
  disableUncheck?: boolean;
  disableUncheckTooltip?: string;
  domains: string[];
};

export const ALL_APPS_DOMAINS = ['cognite.com', 'docs.cognite.com'];

export const COGNITE_APPLICATIONS: Application[] = [
  {
    name: 'AIR',
    domains: [
      'air.cogniteapp.com',
      'air.*.cogniteapp.com',
      'air.staging.cogniteapp.com',
      'air.staging.*.cogniteapp.com',
      '*.air-fe.preview.cogniteapp.com',
      '*-air-fe.pr.cogniteapp.com',
      '*-air-fe.pr.*.cogniteapp.com',
    ],
  },

  {
    name: 'Best Day',
    domains: [
      'bestday.cogniteapp.com',
      'bestday.*.cogniteapp.com',
      'bestday.staging.cogniteapp.com',
      'bestday.staging.*.cogniteapp.com',
      '*.bestday.preview.cogniteapp.com',
      '*-bestday.pr.cogniteapp.com',
      '*-bestday.pr.*.cogniteapp.com',
    ],
  },

  {
    name: 'Cognite Charts',
    domains: [
      'charts.cogniteapp.com',
      'charts.*.cogniteapp.com',
      'charts.staging.cogniteapp.com',
      'charts.*.cogniteapp.com',
      '*-charts.pr.cogniteapp.com',
      '*-charts.pr.*.cogniteapp.com',
    ],
  },

  {
    name: 'Discover',
    domains: [
      'discover.cogniteapp.com',
      'discover.*.cogniteapp.com',
      'discover.preview.cogniteapp.com',
      'discover.preview.*.cogniteapp.com',
      'discover.staging.cogniteapp.com',
      'discover.staging.*.cogniteapp.com',
      '*.discover.preview.cogniteapp.com',
      '*-discover.pr.cogniteapp.com',
      '*-discover.pr.*.cogniteapp.com',
    ],
  },

  {
    name: 'Discovery',
    domains: ['discovery.cogniteapp.com', 'staging.discovery.cogniteapp.com'],
  },

  {
    name: 'Fusion',
    disableUncheck: true,
    disableUncheckTooltip: 'Cannot remove current application from whitelist',
    domains: [
      'fusion.cognite.com',
      'next-release.fusion.cognite.com',
      'staging.fusion.cognite.com',
      '*.pr.console.cogniteapp.com',
      'staging.fusion.cognite.com',
      'dev.fusion.cogniteapp.com',
      '*.fusion.preview.cogniteapp.com',
    ],
  },

  {
    name: 'File Explorer',
    domains: ['files.cogniteapp.com'],
  },

  {
    name: 'Infield',
    domains: [
      'infield.cogniteapp.com',
      'infield.*.cogniteapp.com',
      'infield.staging.cogniteapp.com',
      'infield.staging.*.cogniteapp.com',
      'infield.preview.cogniteapp.com',
      'infield.preview.*.cogniteapp.com',
      '*.infield.preview.cogniteapp.com',
      '*-infield.pr.cogniteapp.com',
      '*-infield.pr.*.cogniteapp.com',
    ],
  },

  {
    name: 'Insight',
    domains: [
      'insight.cogniteapp.com',
      'insight.*.cogniteapp.com',
      'mvp1.insight.cogniteapp.com',
      'insight.staging.cogniteapp.com',
      'insight.preview.cogniteapp.com',
      '*.insight.preview.cogniteapp.com',
      '*.operational-intelligence.preview.cogniteapp.com',
      '*-insight.pr.cogniteapp.com',
      '*-insight.pr.*.cogniteapp.com',
    ],
  },

  {
    name: 'Isoplan',
    domains: [
      'isoplan.cogniteapp.com',
      'isoplan.*.cogniteapp.com',
      'isoplan.preview.cogniteapp.com',
      'isoplan.preview.*.cogniteapp.com',
      'isoplan.staging.cogniteapp.com',
      'isoplan.staging.*.cogniteapp.com',
      '*.isoplan.preview.cogniteapp.com',
      '*-isoplan.pr.cogniteapp.com',
      '*-isoplan.pr.*.cogniteapp.com',
    ],
  },

  {
    name: 'Offshore Activities Optimization',
    domains: [
      'mp.cogniteapp.com',
      'mp.*.cogniteapp.com',
      'mp.staging.cogniteapp.com',
      'mp.staging.*.cogniteapp.com',
      '*.maintenance-planner.preview.cogniteapp.com',
      '*-mp.pr.cogniteapp.com',
      '*-mp.pr.*.cogniteapp.com',
    ],
  },

  {
    name: 'Robot Mission Control',
    domains: ['robots.cogniteapp.com', 'robots-dev.cogniteapp.com'],
  },

  {
    name: 'Demo apps',
    domains: [
      'react-demo.cogniteapp.com',
      'react-demo.*.cogniteapp.com',
      'react-demo.staging.cogniteapp.com',
      'react-demo.staging.*.cogniteapp.com',
      'react-demo.preview.cogniteapp.com',
      'react-demo.preview.*.cogniteapp.com',
      '*.react-demo.preview.cogniteapp.com',
      '*-react-demo.pr.cogniteapp.com',
      '*-react-demo.pr.*.cogniteapp.com',
      'tenant-selector.cogniteapp.com',
      'tenant-selector.*.cogniteapp.com',
      'tenant-selector.staging.cogniteapp.com',
      'tenant-selector.staging.*.cogniteapp.com',
      'tenant-selector.preview.cogniteapp.com',
      'tenant-selector.preview.*.cogniteapp.com',
      '*.tenant-selector.preview.cogniteapp.com',
      '*-tenant-selector.pr.cogniteapp.com',
      '*-tenant-selector.pr.*.cogniteapp.com',
    ],
  },

  {
    name: 'Local development',
    domains: ['localhost'],
  },

  // // other...
  // {
  //   name: 'Other',
  //   domains: [
  //     'admin.cogniteapp.com', // deprecated
  //     'clap.cogniteapp.com', // project-specific?
  //     'clapahack.cogniteapp.com',  // project specific?
  //     'cognitedata.github.io', // ???
  //     'evergreen.cogniteapp.com', // customer/project specific?
  //     'iamdesigner.cogniteapp.com', // project specific?
  //     'omv-well-flow-rates.cogniteapp.com', // customer/project specific?
  //     'owa.bp.cogniteapp.com', // customer/project specific?
  //     '*.javascript-getting-started.preview.cogniteapp.com', // ???
  //     'staging.cwp.cogniteapp.com', // customer/project specific? // ???
  //     'staging.omv-well-flow-rates.cogniteapp.com', // customer/project specific? // ???
  //     'staging.owa.bp.cogniteapp.com', // customer/project specific? // ???
  //     'tetrapak-smart-maintenance.cogniteapp.com', // ???
  //     'token-grabber.docs.preview.cogniteapp.com', // ???
  //     'twin.cogniteapp.com', // ???
  //     'uc2-dev.noc.cogniteapp.com', // customer/project specific? // ???
  //     'uc2-test.noc.cogniteapp.com', // customer/project specific? // ???
  //     'staging.yardmap.cogniteapp.com', // customer/project specific? // ???
  //     'yardmap.cogniteapp.com', // customer/project specific? // ???
  //   ],
  // },
];

export const FUSION_APPLICATION: Application | undefined =
  COGNITE_APPLICATIONS.find((app) => app.name === 'Fusion');
