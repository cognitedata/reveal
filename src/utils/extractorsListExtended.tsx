import osiImgUrl from 'assets/osi-soft.png';
import odbcImgUrl from 'assets/odbc.png';
import opcuaImgUrl from 'assets/opc-ua.png';
import documentumImgUrl from 'assets/documentum.png';
import piafImgUrl from 'assets/piaf.png';
import prosperImgUrl from 'assets/prosper.png';

export type ExtractorExtended = {
  imagePath: string | any;
  tags: string[];
  links: Array<{
    title: string;
    url: string;
  }>;
  source?: string;
  docs?: string;
};

export const extractorsListExtended: {
  [key: string]: ExtractorExtended;
} = {
  'cognite-db': {
    imagePath: odbcImgUrl,
    tags: ['DB', 'Database', 'Cognite Extractor', 'ODBC'],
    links: [
      {
        title: 'Server requirements',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/db#tag/Schema/operation/getTransformationSchema',
      },
      {
        title: 'Running as a Docker container',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/db#running-as-a-docker-container',
      },
      {
        title: 'Prerequisites',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/db#prerequisites',
      },
      {
        title: 'Incremental load',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/db#incremental-load',
      },
    ],
  },
  'cognite-doc': {
    imagePath: documentumImgUrl,
    tags: ['Documentum', 'D2', 'Cognite Extractor', 'OpenText'],
    links: [],
  },
  'cognite-opcua': {
    imagePath: opcuaImgUrl,
    source: 'https://github.com/cognitedata/opcua-extractor-net',
    docs: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua',

    tags: [
      'OPC UA',
      'Cognite Extractor',
      'Time series',
      'Stream',
      'Events',
      'Assets',
    ],
    links: [
      {
        title: 'Extractor features',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/',
      },
      {
        title: 'Hardware requirements',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/opc_ua_hw_requirements',
      },
      {
        title: 'Server requirements',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/opc_ua_server_requirements',
      },
      {
        title: 'Setting up the OPC UA',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/opc_ua_setup',
      },
      {
        title: 'Command-line arguments',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/opc_ua_cli',
      },
      {
        title: 'Configuration settings',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/opc_ua_configuration',
      },
      {
        title: 'Extractor metrics',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/opc_ua_metrics#',
      },
      {
        title: 'Troubleshooting',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/opc_ua_troubleshooting',
      },
      {
        title: "What's new?",
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/changelog',
      },
    ],
  },
  'cognite-pi': {
    imagePath: osiImgUrl,
    source: 'https://github.com/cognitedata/extractor-pi-net',
    docs: 'https://docs.cognite.com/cdf/integration/guides/extraction/pi',
    tags: [
      'PI',
      'Cognite Extractor',
      'Time series',
      'Stream',
      'OSISoft PI Server',
      'PI Points',
    ],
    links: [
      {
        title: 'Server requirements',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/pi#server-requirements',
      },
      {
        title: 'Before you start',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/pi#before-you-start',
      },
      {
        title: 'How the extractor processes data',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/pi#how-the-extractor-processes-data',
      },
    ],
  },
  'cognite-piaf': {
    imagePath: piafImgUrl,
    source: 'https://github.com/cognitedata/extractor-pi-af-net',
    tags: [
      'PI',
      'Cognite Extractor',
      'Time series',
      'Stream',
      'OSISoft PI Server',
      'PI Points',
    ],
    links: [],
  },
  'cognite-simconnect': {
    imagePath: prosperImgUrl,
    tags: ['Simulator', 'Connector', 'Cognite Extractor', 'Prosper'],
    links: [],
  },
};
