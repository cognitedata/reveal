import React, { useState, useEffect, useContext } from 'react';
import { Button, Colors, Tooltip } from '@cognite/cogs.js';
import { apiStatuses } from 'utils/statuses';
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
      let statusColor = Colors['greyscale-grey3'].hex();
      let statusText: string | undefined = 'Couldn`t find status';
      if (
        rev.translations &&
        rev.translations.length > 0 &&
        rev.translations[rev.translations.length - 1].status
      ) {
        const translation = rev.translations[rev.translations.length - 1];
        if (translation.status === apiStatuses.Succeeded) {
          statusColor = Colors.success.hex();
        } else if (translation.status === apiStatuses.InProgress) {
          statusColor = Colors.yellow.hex();
        } else if (translation.status === apiStatuses.Failed) {
          statusColor = Colors.danger.hex();
        }
        statusText = translation.status;
      }
      return {
        key: rev.id,
        objectId: rev.object_id,
        statusOk: (
          <Tooltip content={statusText}>
            <StatusDot bgColor={statusColor} />
          </Tooltip>
        ),
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
