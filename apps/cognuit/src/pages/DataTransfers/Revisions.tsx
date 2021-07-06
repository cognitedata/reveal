import React, { useState, useEffect, useContext } from 'react';
import { Colors, Loader, Tooltip } from '@cognite/cogs.js';
import { apiStatuses } from 'utils/statuses';
import { CustomError } from 'services/CustomError';
import { Revision } from 'types/ApiInterface';
import { DataTransferObject } from 'typings/interfaces';
import ApiContext from 'contexts/ApiContext';

import { DataTransfersTableData } from './types';
import {
  DetailButton,
  RevisionContainer,
  RevisionLabel,
  StatusDot,
} from './elements';
import { getFormattedTimestampOrString } from './utils';

type Props = {
  record: DataTransfersTableData;
  onDetailClick: (record: DataTransfersTableData, revision: Revision) => void;
};

type DataType = {
  key: number;
  name: JSX.Element;
  statusOk: JSX.Element;
  details: JSX.Element;
  objectId: number;
  lastUpdated: JSX.Element;
  datatype?: JSX.Element;
  author?: JSX.Element;
};

const Revisions = ({ record, onDetailClick }: Props) => {
  const [data, setData] = useState<DataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { api } = useContext(ApiContext);

  const getRevisionsList = (): DataType[] =>
    record.revisions.reverse().map((rev: Revision) => {
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
            <div>{rev.revision}</div>
          </div>
        ),
        lastUpdated: (
          <div>
            <RevisionLabel>Last changed</RevisionLabel>
            <div>
              {rev.translations &&
                getFormattedTimestampOrString(
                  rev.translations[rev.translations.length - 1].revision
                    .last_updated
                )}
            </div>
          </div>
        ),
        details: (
          <DetailButton onClick={() => onDetailClick(record, rev)}>
            Detail view
          </DetailButton>
        ),
      };
    });

  const getSingleObj = async (revision: DataType) =>
    api!.objects.getSingleObject(revision.objectId).then((res) => res[0]);

  useEffect(() => {
    const runEffect = async () => {
      setIsLoading(true);
      const revisions = getRevisionsList();
      setData(revisions);

      Promise.all(
        revisions.map(async (rev: DataType) => {
          const singleObj: DataTransferObject = await getSingleObj(rev);
          return {
            ...rev,
            // Mark as delete - not being used
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
      )
        .then((resp: any) => {
          setData(resp);
        })
        .catch((err: CustomError) => {
          // eslint-disable-next-line no-console
          console.log('Error', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    runEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <RevisionContainer>
      {data.map((item) => {
        return (
          <React.Fragment key={item.key}>
            {item.statusOk}
            {item.name}
            {item.lastUpdated}
            {item.author}
            {item.details}
          </React.Fragment>
        );
      })}
    </RevisionContainer>
  );
};

export default Revisions;
