import React, { useState, useEffect, useContext } from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import { DataTransferObject } from '../../typings/interfaces';
import ApiContext from '../../contexts/ApiContext';
import { SubTable, RevisionLabel, StatusDot } from './elements';
import { getRevisionDateOrString } from './utils';

type Props = {
  record: DataTransferObject;
  onDetailClick: (
    record: DataTransferObject,
    revision: DataTransferObject
  ) => void;
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

  const getRevisionsList = async () => {
    return api!.revisions.get(record.id).then((response) => {
      return response.map((rev) => ({
        key: rev.id,
        objectId: rev.object_id,
        statusOk: (
          <StatusDot
            bgColor={rev.status_ok ? Colors.success.hex() : Colors.danger.hex()}
          />
        ),
        name: (
          <div>
            <RevisionLabel>Revision</RevisionLabel>
            <div>{getRevisionDateOrString(rev.revision)}</div>
          </div>
        ),
        details: (
          <Button onClick={() => onDetailClick(record, rev)}>
            Detail view
          </Button>
        ),
      }));
    });
  };

  const getSingleObj = async (revision: DataTransferObject) => {
    return api!.objects
      .getSingleObject(revision.objectId)
      .then((res) => res[0]);
  };

  useEffect(() => {
    const runEffect = async () => {
      const revisions = await getRevisionsList();
      setData(revisions);
      Promise.all(
        revisions.map(async (rev) => {
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
      ).then((resp) => {
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
    />
  );
};

export default Revisions;
