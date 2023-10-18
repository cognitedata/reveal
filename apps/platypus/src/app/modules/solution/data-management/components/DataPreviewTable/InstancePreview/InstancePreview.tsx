import React, { useMemo } from 'react';

import { DataModelTypeDefsType } from '@platypus/platypus-core';

import { CogDataList } from '@cognite/cog-data-grid';
import { Body } from '@cognite/cogs.js';

import { usePreviewData } from '../../../hooks/usePreviewData';

export const InstancePreview = (props: {
  dataModelType: DataModelTypeDefsType;
  externalId: string;
  instanceSpace: string;
}) => {
  const { dataModelType, externalId, instanceSpace } = props;

  const { data: previewData } = usePreviewData({
    dataModelType,
    externalId,
    instanceSpace,
    nestedLimit: 2,
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
      {previewData ? (
        <CogDataList
          data-cy="instance-values"
          listData={[{ name: 'externalId' }, ...nonRelationshipValues].map(
            (key) => `${key.name}: ${previewData[key.name]}`
          )}
        />
      ) : (
        <Body level={2}>Loading...</Body>
      )}
    </>
  );
};
