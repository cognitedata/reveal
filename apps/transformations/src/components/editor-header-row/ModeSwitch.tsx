import { useState } from 'react';

import { useQueryClient, useIsMutating } from '@tanstack/react-query';
import { useTranslation } from '@transformations/common';
import {
  getDefaultMapping,
  getTransformationMapping,
  isMappingMode,
  getUpdateMapping,
  isSourceRawTable,
} from '@transformations/components/source-mapping/utils';
import {
  getTransformationMutationKey,
  useUpdateTransformation,
} from '@transformations/hooks';
import { RawTableIcon } from '@transformations/pages/transformation-details/styled-components';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';
import { TransformationRead } from '@transformations/types';
import {
  getRawTabKey,
  shouldDisableUpdatesOnTransformation,
} from '@transformations/utils';

import { Button, Modal } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

export default function ModeSwitch({
  transformation,
}: {
  transformation: TransformationRead;
}) {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const mappingMode = isMappingMode(transformation.query);
  const { mutateAsync, isLoading } = useUpdateTransformation();
  const { t } = useTranslation();

  const activeMutations = useIsMutating(getTransformationMutationKey());

  const isMutatating = isLoading || activeMutations > 0;

  const { setActiveInspectSectionKey, addTab } = useTransformationContext();

  const onOk = async () => {
    const mappings =
      getTransformationMapping(transformation.query) ||
      (await getDefaultMapping(sdk, queryClient, transformation));

    if (mappings) {
      await mutateAsync(
        getUpdateMapping(transformation, {
          ...mappings,
          enabled: !mappingMode,
        })
      );

      if (!mappings.enabled && isSourceRawTable(transformation)) {
        addTab({
          type: 'raw',
          database: mappings.sourceLevel1!,
          table: mappings.sourceLevel2!,
          key: getRawTabKey(mappings.sourceLevel1!, mappings.sourceLevel2!),
          title: mappings.sourceLevel2!,
          icon: <RawTableIcon type="DataTable" />,
        });
        setActiveInspectSectionKey('browse-source');
      }
    }
    setModalVisible(false);
  };

  if (mappingMode) {
    return (
      <Button
        size="small"
        icon="Exchange"
        type="ghost-accent"
        disabled={
          isMutatating || shouldDisableUpdatesOnTransformation(transformation)
        }
        onClick={onOk}
      >
        {t('details-sql-mode')}
      </Button>
    );
  } else {
    return (
      <>
        <Modal
          title={t('details-mapping-mode')}
          icon="WarningFilled"
          size="small"
          visible={modalVisible}
          okText={t('details-mapping-button-switch')}
          okDisabled={
            isLoading || shouldDisableUpdatesOnTransformation(transformation)
          }
          onOk={onOk}
          onCancel={() => setModalVisible(false)}
        >
          {t('details-mapping-mode-warning')}
        </Modal>
        <Button
          disabled={
            isMutatating || shouldDisableUpdatesOnTransformation(transformation)
          }
          icon="Exchange"
          type="ghost-accent"
          onClick={() => {
            setModalVisible(true);
          }}
          size="small"
        >
          {t('details-mapping-mode')}
        </Button>
      </>
    );
  }
}
