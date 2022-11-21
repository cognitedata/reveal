import React, { useMemo } from 'react';
import { DataModelTypeDefsType } from '@platypus/platypus-core';
import { usePreviewData } from '@platypus-app/modules/solution/data-management/hooks/usePreviewData';
import { CogDataList } from '@cognite/cog-data-grid';
import { Body } from '@cognite/cogs.js';

export const InstancePreview = (props: {
  externalId: string;
  dataModelExternalId: string;
  dataModelType: DataModelTypeDefsType;
}) => {
  const { dataModelExternalId, dataModelType, externalId } = props;

  const { data } = usePreviewData({
    dataModelExternalId,
    dataModelType,
    externalId,
  });

  const nonRelationshipValues = useMemo(() => {
    if (!dataModelType) {
      return [];
    }
    return dataModelType.fields.filter(
      (el) => !el.type.list && !el.type.custom
    );
  }, [dataModelType]);

  if (!externalId) {
    return null;
  }

  return (
    <>
      {data ? (
        <CogDataList
          data-cy="instance-values"
          listData={[{ name: 'externalId' }, ...nonRelationshipValues].map(
            (key) => `${key.name}: ${data[key.name]}`
          )}
        />
      ) : (
        <Body level={2}>Loading...</Body>
      )}
    </>
  );
};
