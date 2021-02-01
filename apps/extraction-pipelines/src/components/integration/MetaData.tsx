import React, { PropsWithChildren } from 'react';
import { NO_META_DATA } from '../../utils/constants';
import { MetaField } from './MetaDataField';
import { MetaData as MetaDataModel } from '../../model/MetaData';

interface MetaProps {
  metadata?: MetaDataModel;
  testId?: string;
}

export const MetaData = ({
  metadata,
  testId = 'meta-',
}: PropsWithChildren<MetaProps>) => {
  if (!metadata) {
    return <i>{NO_META_DATA}</i>;
  }
  return (
    <>
      {Object.entries(metadata).map(([k, v], index) => {
        return (
          <React.Fragment key={`${testId}-${k}-${v}`}>
            <MetaField
              fieldKey={k}
              fieldValue={v}
              testId={`${testId}-${index}`}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};
