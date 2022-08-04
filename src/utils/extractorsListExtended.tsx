import osiImgUrl from 'assets/osi-soft.png';
import odbcImgUrl from 'assets/odbc.png';
import opcuaImgUrl from 'assets/opc-ua.png';
import documentumImgUrl from 'assets/documentum.png';
import piafImgUrl from 'assets/piaf.png';
import prosperImgUrl from 'assets/prosper.png';
import { ExtractorLinks } from 'service/extractors';

export interface ExtractorExtended extends ExtractorLinks {
  imagePath: string | any;
  tags: string[];
}

export const extractorsListExtended: {
  [key: string]: ExtractorExtended;
} = {
  'cognite-db': {
    imagePath: odbcImgUrl,
    tags: ['DB', 'Database', 'Cognite Extractor', 'ODBC'],
    links: [
      {
        name: 'Server requirements',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/db#tag/Schema/operation/getTransformationSchema',
        type: 'externalDocumentation',
      },
      {
        name: 'Running as a Docker container',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/db#running-as-a-docker-container',
        type: 'externalDocumentation',
      },
      {
        name: 'Prerequisites',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/db#prerequisites',
        type: 'externalDocumentation',
      },
      {
        name: 'Incremental load',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/db#incremental-load',
        type: 'externalDocumentation',
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
        name: 'GitHub',
        url: 'https://github.com/cognitedata/opcua-extractor-net',
        type: 'generic',
      },
      {
        name: 'Documenation',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua',
        type: 'generic',
      },
      {
        name: 'Extractor features',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/',
        type: 'externalDocumentation',
      },
      {
        name: 'Hardware requirements',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/opc_ua_hw_requirements',
        type: 'externalDocumentation',
      },
      {
        name: 'Server requirements',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/opc_ua_server_requirements',
        type: 'externalDocumentation',
      },
      {
        name: 'Setting up the OPC UA',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/opc_ua_setup',
        type: 'externalDocumentation',
      },
      {
        name: 'Command-line arguments',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/opc_ua_cli',
        type: 'externalDocumentation',
      },
      {
        name: 'Configuration settings',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/opc_ua_configuration',
        type: 'externalDocumentation',
      },
      {
        name: 'Extractor metrics',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/opc_ua_metrics#',
        type: 'externalDocumentation',
      },
      {
        name: 'Troubleshooting',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/opc_ua_troubleshooting',
        type: 'externalDocumentation',
      },
      {
        name: "What's new?",
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua/changelog',
        type: 'externalDocumentation',
      },
    ],
  },
  'cognite-pi': {
    imagePath: osiImgUrl,
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
        name: 'GitHub',
        url: 'https://github.com/cognitedata/extractor-pi-net',
        type: 'generic',
      },
      {
        name: 'Documentation',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/pi',
        type: 'generic',
      },
      {
        name: 'Server requirements',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/pi#server-requirements',
        type: 'externalDocumentation',
      },
      {
        name: 'Before you start',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/pi#before-you-start',
        type: 'externalDocumentation',
      },
      {
        name: 'How the extractor processes data',
        url: 'https://docs.cognite.com/cdf/integration/guides/extraction/pi#how-the-extractor-processes-data',
        type: 'externalDocumentation',
      },
    ],
  },
  'cognite-piaf': {
    imagePath: piafImgUrl,
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
        name: 'GitHub',
        url: 'https://github.com/cognitedata/extractor-pi-af-net',
        type: 'generic',
      },
    ],
  },
  'cognite-simconnect': {
    imagePath: prosperImgUrl,
    tags: ['Simulator', 'Connector', 'Cognite Extractor', 'Prosper'],
    links: [],
  },
};
