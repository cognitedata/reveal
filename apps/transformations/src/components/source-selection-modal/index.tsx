import { useState } from 'react';

import { useTranslation } from '@transformations/common';
import {
  getTransformationMapping,
  getUpdateMapping,
} from '@transformations/components/source-mapping/utils';
import { useUpdateTransformation } from '@transformations/hooks';
import { RawTableIcon } from '@transformations/pages/transformation-details/styled-components';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';
import { TransformationRead } from '@transformations/types';
import { getRawTabKey } from '@transformations/utils';
import isEqual from 'lodash/isEqual';

import { Modal } from '@cognite/cogs.js';

import CleanColumn from './CleanColumn';
import DatabaseColumn from './DatabaseColumn';
import DMSVersionColumn from './DMSVersionColumn';
import ModelColumn from './ModelColumn';
import { ColumnContainer } from './styled-components';
import TableColumn from './TableColumn';
import { Props2 } from './types';
import ViewColumn from './ViewColumn';

type Props = {
  transformation: TransformationRead;
  onCancel: () => void;
};
export default function SourceSelectionModal({
  transformation,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const mapping = getTransformationMapping(transformation.query);

  const [localMapping, updateLocalMapping] = useState(mapping);

  const { mutateAsync, isLoading } = useUpdateTransformation();

  const { setActiveInspectSectionKey, addTab } = useTransformationContext();

  if (!localMapping) {
    // TODO
    return null;
  }

  const validSource =
    !!localMapping.sourceType &&
    !!localMapping.sourceLevel1 &&
    !!localMapping.sourceLevel2;

  const isSourceRawTable =
    localMapping?.sourceType === 'raw' &&
    !!localMapping.sourceLevel1 &&
    !!localMapping.sourceLevel2;

  return (
    <Modal
      title={t('select-source')}
      okText={t('apply-selection')}
      icon={isLoading ? 'Loader' : undefined}
      okDisabled={isEqual(mapping, localMapping) || !validSource || isLoading}
      cancelText={t('cancel')}
      visible={true}
      showBorders={true}
      size="large"
      onCancel={onCancel}
      onOk={async () => {
        await mutateAsync(
          getUpdateMapping(transformation, {
            ...localMapping,
            mappings: localMapping.mappings.map(({ to, asType }) => ({
              from: '',
              to,
              asType,
            })),
          })
        );
        if (isSourceRawTable) {
          addTab({
            type: 'raw',
            database: localMapping.sourceLevel1!,
            table: localMapping.sourceLevel2!,
            key: getRawTabKey(
              localMapping.sourceLevel1!,
              localMapping.sourceLevel2!
            ),
            title: localMapping.sourceLevel2!,
            icon: <RawTableIcon type="DataTable" />,
          });
          setActiveInspectSectionKey('browse-source');
        }
        onCancel();
      }}
    >
      <SourceColumns
        key={transformation.id}
        mapping={localMapping}
        update={updateLocalMapping}
      />
    </Modal>
  );
}

function SourceColumns({ mapping, update }: Props2) {
  const [space, externalId, version] = mapping.sourceLevel1?.split('.') || [];
  return (
    <ColumnContainer>
      <ModelColumn mapping={mapping} update={update} />
      {mapping.sourceType === 'raw' && (
        <DatabaseColumn mapping={mapping} update={update} />
      )}
      {mapping.sourceType === 'raw' && mapping.sourceLevel1 && (
        <TableColumn
          database={mapping.sourceLevel1}
          mapping={mapping}
          update={update}
        />
      )}
      {mapping.sourceType === 'clean' && (
        <CleanColumn mapping={mapping} update={update} />
      )}
      {mapping.sourceType === 'fdm' && space && externalId && (
        <DMSVersionColumn
          mapping={mapping}
          update={update}
          space={space}
          externalId={externalId}
        />
      )}
      {mapping.sourceType === 'fdm' && space && externalId && version && (
        <ViewColumn
          mapping={mapping}
          update={update}
          space={space}
          version={version}
          externalId={externalId}
        />
      )}
    </ColumnContainer>
  );
}
