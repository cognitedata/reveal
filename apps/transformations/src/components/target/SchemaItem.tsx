import { useMemo } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import SparkColumnType from '@transformations/components/spark-column-type/SparkColumnType';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';
import { Schema, TransformationRead } from '@transformations/types';
import {
  ColorStatus,
  getIconPropsFromWarningType,
  getPreviewWarnings,
} from '@transformations/utils';

import { Colors, Icon, Tooltip } from '@cognite/cogs.js';

type Props = {
  schema: Schema;
  transformation: TransformationRead;
};
export default function SchemaItem({
  schema,
  transformation,
}: Props): JSX.Element {
  const { name, nullable } = schema;

  const { t } = useTranslation();

  const { lastPreview } = useTransformationContext();

  const warnings = useMemo(
    () =>
      getPreviewWarnings(
        lastPreview?.data,
        [schema],
        transformation.destination
      ),
    [lastPreview, schema, transformation.destination]
  );

  const warning = warnings?.find(({ column }) => column === name);

  const iconProps = warning?.type
    ? getIconPropsFromWarningType(warning.type)
    : undefined;

  return (
    <StyledSchemaField $status={iconProps?.status}>
      {!!warning && (
        <StyledSchemaIconContainer>
          <Tooltip content={t(`details-warnings-${warning.type}-short`)}>
            <Icon type="WarningFilled" />
          </Tooltip>
        </StyledSchemaIconContainer>
      )}
      <StyledSchemaFieldName>{name}</StyledSchemaFieldName>

      <SparkColumnType schema={schema} />

      <StyledSchemaIconContainer>
        {!nullable && (
          <Tooltip content={t('non-nullable')}>
            <Icon size={14} type="ExclamationMark" />
          </Tooltip>
        )}
      </StyledSchemaIconContainer>
    </StyledSchemaField>
  );
}

const StyledSchemaField = styled.div<{ $status?: ColorStatus }>`
  align-items: center;
  display: flex;

  border-radius: 6px;
  height: 36px;
  padding: 8px;

  background-color: ${({ $status }) =>
    Colors[`surface--status-${$status || 'undefined'}--muted--default`]};
  color: ${({ $status }) =>
    Colors[`text-icon--status-${$status || 'undefined'}`]};
`;

const StyledSchemaFieldName = styled.div`
  flex: 1;

  :not(:first-child) {
    margin-left: 8px;
  }
`;

const StyledSchemaIconContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  max-width: 16px;
  width: 16px;
  height: 16px;
`;
