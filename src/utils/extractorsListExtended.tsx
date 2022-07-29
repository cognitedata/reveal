import osiImgUrl from 'assets/osi-soft.png';
import odbcImgUrl from 'assets/odbc.png';
import opcuaImgUrl from 'assets/opc-ua.png';
import documentumImgUrl from 'assets/documentum.png';
import piafImgUrl from 'assets/piaf.png';
import prosperImgUrl from 'assets/prosper.png';

export type ExtractorExtended = {
  imagePath: string | any;
  body: string;
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
    body: `
      <p>
        The Cognite DB Extractor is a general database extractor that connects to one or more databases, executes queries, and sends the results to the staging area in Cognite Data Fusion (CDF).
      </p>
      <p>
        The extractor connects to databases using ODBC, and you need ODBC drivers for the databases you're connecting to. Typically, the database vendors provide the necessary ODBC drivers for their databases.
      </p>
      <p>
        The extractor is available as:
        <ul>
          <li>A native Windows application.</li>
          <li>
            A Docker image for Unix-based systems (for example, Mac OS and
            Linux).
          </li>
        </ul>
      </p>
    `,
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
    body: `<p>A file extractor gathering documents from the OpenText Documentum or OpenText D2 systems.</p>`,
    tags: ['Documentum', 'D2', 'Cognite Extractor', 'OpenText'],
    links: [],
  },
  'cognite-opcua': {
    imagePath: opcuaImgUrl,
    source: 'https://github.com/cognitedata/opcua-extractor-net',
    docs: 'https://docs.cognite.com/cdf/integration/guides/extraction/opc_ua',
    body: `
      <p>
        The Cognite OPC UA extractor reads time series, events, and asset information via the open OPC UA protocol.
        The extractor copies the OPC UA node hierarchy to Cognite Data Fusion (CDF), then streams data and events to time series in CDF.
      </p>
    `,
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
    body: `
      <p>
        The OSISoft PI Server collects, stores, and organizes data from sensors and control systems and is widely used across many industries.
        The OSISoft PI Server stores information as PI Points in a PI Data Archive. PI Points correspond to time series in Cognite Data Fusion (CDF).
      </p>
      <p>
        The Cognite PI Extractor connects to the PI Data Archive, detects and extracts time series data, and transfers the data to your CDF project
        to make time series available in near real-time. The extractor streams data continuously, and in parallel, ingests historical data (backfilling) to make all time series data available in CDF.
      </p>
    `,
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
    body: `<p>An extractor for writing data from the Osisoft PI Asset Framework to Raw.</p>`,
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
    body: `<p>A Connector that integrates the PROSPER simulator with CDF.</p>`,
    tags: ['Simulator', 'Connector', 'Cognite Extractor', 'Prosper'],
    links: [],
  },
};
