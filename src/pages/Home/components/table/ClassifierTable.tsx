import { Loader, Table } from '@cognite/cogs.js';
import { Classifier } from '@cognite/sdk-playground';
import { Empty } from 'components/states/Empty';
import { homeConfig } from 'configs/global.config';
import React from 'react';
import { useDocumentsClassifiersQuery } from 'services/query/documents/query';
import { curateColumns } from './curateClassifierColumns';

export const ClassifierTable: React.FC = () => {
  const { isLoading } = useDocumentsClassifiersQuery();

  const test = [
    {
      projectId: 123,
      name: 'name',
      createdAt: 1627988359773,
      status: 'failed',
      active: false,
      id: 1596504617426724,
    },
    {
      projectId: 123,
      name: 'name',
      createdAt: 1628072920221,
      status: 'training',
      active: false,
      id: 6994079749032633,
    },
    {
      projectId: 123,
      name: 'name',
      createdAt: 1628080015804,
      status: 'finished',
      active: true,
      id: 4784470505715878,
      metrics: {
        precision: 0.9450549450549451,
        recall: 0.9230769230769231,
        f1Score: 0.9209401709401709,
        confusionMatrix: [
          [7, 0, 0, 0, 0, 0, 4],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 10, 0, 0, 0, 0],
          [0, 0, 0, 10, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 11, 0],
          [0, 0, 0, 0, 0, 0, 10],
        ],
        labels: [
          'CORE_DESCRIPTION',
          'APA_APPLICATION',
          'PID',
          'SCIENTIFIC_ARTICLE',
          'FINAL_WELL_REPORT',
          'RISK_ASSESSMENT',
          'Unknown',
        ],
      },
    },
  ];

  const columns = React.useMemo(() => curateColumns(), []);

  if (isLoading) {
    return <Loader darkMode />;
  }

  return (
    <Table<Classifier>
      pagination={false}
      dataSource={test}
      columns={columns as any}
      locale={{
        emptyText: (
          <Empty
            title={homeConfig.EMPTY_TABLE_TITLE}
            description={homeConfig.EMPTY_TABLE_DESCRIPTION}
          />
        ),
      }}
    />
  );
};
