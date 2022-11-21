import { Body, Tag, Tooltip } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
} from '@platypus/platypus-core';
import { ICellRendererParams } from 'ag-grid-community';
import React, { useMemo, useState } from 'react';
import { usePreviewData } from '../../../hooks/usePreviewData';

const PROPERTY_TO_SHOW = 3;
const DEBOUNCE_HOVER_TIME = 3;

export const CustomCellRenderer = React.memo((props: ICellRendererParams) => {
  const { t } = useTranslation('CustomCellRenderer');
  const [_, setIsHovered] = useState(false);
  const { dataModelExternalId, dataModelType, dataModelTypeDefs } =
    props.context as {
      dataModelExternalId: string;
      version: string;
      dataModelType: DataModelTypeDefsType;
      dataModelTypeDefs: DataModelTypeDefs;
    };

  const columnType = useMemo(
    () =>
      dataModelTypeDefs?.types.find(
        (type) =>
          type.name ===
          dataModelType.fields.find(
            (field) => props.colDef?.field === field.name
          )!.type.name
      ),
    [dataModelTypeDefs, dataModelType, props.colDef]
  );
  const { data: previewData, refetch } = usePreviewData(
    {
      dataModelExternalId,
      dataModelType: columnType!,
      externalId: props.value,
    },
    { enabled: false }
  );

  const debounchedSearch = () => {
    setTimeout(() => {
      setIsHovered((val) => {
        if (!previewData && val && columnType) {
          refetch();
        }
        return val;
      });
    }, DEBOUNCE_HOVER_TIME);
  };

  const nonListAndRelationshipValues = useMemo(() => {
    if (!columnType) {
      return [];
    }
    return [
      { name: 'externalId' },
      ...columnType.fields.filter((el) => !el.type.list && !el.type.custom),
    ];
  }, [columnType]);

  if (!props.value) {
    return null;
  }

  return (
    <Tooltip
      content={
        previewData ? (
          <div key="content">
            {nonListAndRelationshipValues
              .slice(0, PROPERTY_TO_SHOW)
              .map((key) => (
                <Body
                  level={2}
                  key={key.name}
                  style={{
                    maxWidth: '400px',
                    color: 'white',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >{`${key.name}: ${previewData[key.name]}`}</Body>
              ))}
            {nonListAndRelationshipValues.length > PROPERTY_TO_SHOW && (
              <Body level={2} style={{ color: 'white' }}>
                ...
              </Body>
            )}
          </div>
        ) : (
          <Body key="loading" level={2} style={{ color: 'white' }}>
            {t('cell_loading', 'Loading...')}
          </Body>
        )
      }
      onShow={() => {
        if (!previewData) {
          setIsHovered(true);
          debounchedSearch();
        }
      }}
      onHide={() => setIsHovered(false)}
    >
      <Tag>{props.value}</Tag>
    </Tooltip>
  );
});
