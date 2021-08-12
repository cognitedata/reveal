import { DataTransfersTableData } from 'pages/DataTransfers/types';

export const fixtureInitialSelectedColumnNames = ['status', 'name'];

export const fixtureDataTransferDataTable: DataTransfersTableData[] = [
  {
    id: 83910,
    source: {
      id: 83910,
      created_time: 1619429869,
      last_updated: 1619429869,
      datatype: 'PointSet',
      connector: 'Studio',
      name: 'PointSet - 7',
      crs: 'EPSG:23031',
      cdf_metadata: {},
      business_tags: ['Cognuit 87468'],
      data_status: [],
      origin: 'Sourced',
      project: 'SourceTestProject',
      package: null,
      revisions: [
        {
          id: 90408,
          created_time: 1619429981,
          last_updated: 1619429982,
          object_id: 83910,
          revision: '2021-04-26T11:39:41.123 - tagged',
          cdf_file: {
            id: 7299527889933762,
            upload_link: '',
            uploaded: true,
          },
          status: 'Uploaded to staging',
          steps: [
            {
              status: 'Registered',
              error_message: null,
              created_time: 1619429981,
            },
            {
              status: 'Uploaded to staging',
              error_message: null,
              created_time: 1619429982,
            },
          ],
          translations: [
            {
              revision: {
                id: 90946,
                created_time: 1619430289,
                last_updated: 1619430834,
                object_id: 84453,
                revision: '1619430289',
                cdf_file: {
                  id: 2560783907286313,
                  upload_link: '',
                  uploaded: false,
                },
                status: 'Uploaded to connector',
                steps: [
                  {
                    status: 'Registered',
                    error_message: null,
                    created_time: 1619430289,
                  },
                  {
                    status: 'Queued',
                    error_message: null,
                    created_time: 1619430290,
                  },
                  {
                    status: 'Started translation',
                    error_message: null,
                    created_time: 1619430290,
                  },
                  {
                    status: 'Uploaded translation to staging',
                    error_message: null,
                    created_time: 1619430290,
                  },
                  {
                    status: 'Uploaded to connector',
                    error_message: null,
                    created_time: 1619430782,
                  },
                  {
                    status: 'Uploaded to connector',
                    error_message: null,
                    created_time: 1619430834,
                  },
                ],
                translations: null,
              },
              status: 'Succeeded',
            },
          ],
        },
      ],
      external_id: '149ffca6-ece4-492d-bb3a-13a5b31b865e',
      source_created_time: null,
      source_last_updated: null,
      author: null,
      grouping: null,
      source_object_id: null,
      revisions_count: 1,
    },
    status: 'Succeeded',
    target: {
      id: 83910,
      created_time: 1619429869,
      last_updated: 1619429869,
      datatype: 'PointSet',
      connector: 'Studio',
      name: 'PointSet - 7',
      crs: 'EPSG:23031',
      cdf_metadata: {},
      business_tags: ['Cognuit 87468'],
      data_status: [],
      origin: 'Sourced',
      project: 'SourceTestProject',
      package: null,
      revisions: [
        {
          id: 90408,
          created_time: 1619429981,
          last_updated: 1619429982,
          object_id: 83910,
          revision: '2021-04-26T11:39:41.123 - tagged',
          cdf_file: {
            id: 7299527889933762,
            upload_link: '',
            uploaded: true,
          },
          status: 'Uploaded to staging',
          steps: [
            {
              status: 'Registered',
              error_message: null,
              created_time: 1619429981,
            },
            {
              status: 'Uploaded to staging',
              error_message: null,
              created_time: 1619429982,
            },
          ],
          translations: [
            {
              revision: {
                id: 90946,
                created_time: 1619430289,
                last_updated: 1619430834,
                object_id: 84453,
                revision: '1619430289',
                cdf_file: {
                  id: 2560783907286313,
                  upload_link: '',
                  uploaded: false,
                },
                status: 'Uploaded to connector',
                steps: [
                  {
                    status: 'Registered',
                    error_message: null,
                    created_time: 1619430289,
                  },
                  {
                    status: 'Queued',
                    error_message: null,
                    created_time: 1619430290,
                  },
                  {
                    status: 'Started translation',
                    error_message: null,
                    created_time: 1619430290,
                  },
                  {
                    status: 'Uploaded translation to staging',
                    error_message: null,
                    created_time: 1619430290,
                  },
                  {
                    status: 'Uploaded to connector',
                    error_message: null,
                    created_time: 1619430782,
                  },
                  {
                    status: 'Uploaded to connector',
                    error_message: null,
                    created_time: 1619430834,
                  },
                ],
                translations: null,
              },
              status: 'Succeeded',
            },
          ],
        },
      ],
      external_id: '149ffca6-ece4-492d-bb3a-13a5b31b865e',
      source_created_time: null,
      source_last_updated: null,
      author: null,
      grouping: null,
      source_object_id: null,
      revisions_count: 1,
    },
  },
];
