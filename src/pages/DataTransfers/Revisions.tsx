import React, { useState, useEffect, useContext } from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import { DataTransferObject, RevisionObject } from '../../typings/interfaces';
import ApiContext from '../../contexts/ApiContext';
import { SubTable, RevisionLabel, StatusDot } from './elements';
import { getFormattedTimestampOrString } from './utils';

type Props = {
  record: DataTransferObject;
  onDetailClick: (record: DataTransferObject, revision: RevisionObject) => void;
};

type DataType = {
  key: number;
  name: JSX.Element;
  statusOk: JSX.Element;
  details: JSX.Element;
  objectId: number;
  datatype?: JSX.Element;
  author?: JSX.Element;
};

const Revisions = ({ record, onDetailClick }: Props) => {
  const [data, setData] = useState<DataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { api } = useContext(ApiContext);

  const columns = [
    { title: 'Status', dataIndex: 'statusOk', key: 'statusOk' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Data type', dataIndex: 'datatype', key: 'datatype' },
    { title: 'Author', dataIndex: 'author', key: 'author' },
    { title: 'placeholder1', dataIndex: 'placeholder1', key: 'placeholder1' },
    { title: 'placeholder2', dataIndex: 'placeholder2', key: 'placeholder2' },
    { title: 'Details', dataIndex: 'details', key: 'details' },
  ];

  const getRevisionsList = () =>
    record.revisions.reverse().map((rev: RevisionObject) => {
      let statusColor = Colors.yellow.hex();
      if (
        rev.translations &&
        rev.translations.length > 0 &&
        rev.translations[rev.translations.length - 1].steps &&
        rev.steps.length > 0
      ) {
        const translation = rev.translations[rev.translations.length - 1];
        const step = translation.steps[translation.steps.length - 1];
        if (step.status === 'Uploaded to connector') {
          statusColor = Colors.success.hex();
        } else if (step.error_message) {
          statusColor = Colors.danger.hex();
        }
      }
      return {
        key: rev.id,
        objectId: rev.object_id,
        statusOk: <StatusDot bgColor={statusColor} />,
        name: (
          <div>
            <RevisionLabel>Revision</RevisionLabel>
            <div>{getFormattedTimestampOrString(rev.revision)}</div>
          </div>
        ),
        details: (
          <Button onClick={() => onDetailClick(record, rev)}>
            Detail view
          </Button>
        ),
      };
    });

  const getSingleObj = async (revision: DataTransferObject) => {
    return api!.objects
      .getSingleObject(revision.objectId)
      .then((res) => res[0]);
  };

  useEffect(() => {
    const runEffect = async () => {
      const revisions = getRevisionsList();
      setData(revisions);
      setIsLoading(false);
      Promise.all(
        revisions.map(async (rev: RevisionObject) => {
          const singleObj: DataTransferObject = await getSingleObj(rev);
          return {
            ...rev,
            datatype: (
              <div>
                <RevisionLabel>Datatype</RevisionLabel>
                <div>{singleObj.datatype || '--'}</div>
              </div>
            ),
            author: (
              <div>
                <RevisionLabel>Author</RevisionLabel>
                <div>{singleObj.author || '--'}</div>
              </div>
            ),
          };
        })
      ).then((resp: any) => {
        setData(resp);
      });
    };
    runEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SubTable
      columns={columns}
      dataSource={data}
      pagination={false}
      showHeader={false}
      loading={isLoading}
      locale={{
        emptyText: isLoading ? 'Loading...' : 'No data',
      }}
    />
  );
};

export default Revisions;
