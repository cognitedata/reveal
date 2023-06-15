import { useState } from 'react';

import { useTranslation } from '@transformations/common';
import SourceSelectionModal from '@transformations/components/source-selection-modal';
import { TransformationRead } from '@transformations/types';
import { TransformationMapping } from '@transformations/utils';

import { Body, Button, Dropdown, Flex, Menu } from '@cognite/cogs.js';

import { getTransformationMapping } from './utils';

function SourceMenuTitle({ mapping }: { mapping: TransformationMapping }) {
  const { t } = useTranslation();
  switch (mapping.sourceType) {
    case 'raw':
      if (mapping.sourceLevel1 && mapping.sourceLevel2) {
        return (
          <>
            {mapping.sourceLevel1}.{mapping.sourceLevel2}
          </>
        );
      }

      break;
    case 'clean':
      if (mapping.sourceLevel2) {
        // @ts-ignore
        return <>{t(`source-menu-clean-${mapping.sourceLevel2}`)}</>;
      }

      break;
    case 'fdm': {
      const level1 = mapping.sourceLevel1?.split('.');
      const space = level1?.[0];
      const model = level1?.[1];

      return (
        <>
          {model} [{space}]: {mapping.sourceLevel2}
        </>
      );
    }
    default: {
      return <>{t('details-mapping-source-missing')}</>;
    }
  }
  return null;
}

function SourcesMenu({
  transformation,
}: {
  transformation: TransformationRead;
}) {
  const { t } = useTranslation();

  const [sourceModalVisible, setSourceModalVisible] = useState(false);
  const mapping = getTransformationMapping(transformation.query);

  if (!mapping) {
    return null;
  }

  return (
    <Flex gap={8} alignItems="center">
      {sourceModalVisible && (
        <SourceSelectionModal
          onCancel={() => setSourceModalVisible(false)}
          transformation={transformation}
        />
      )}
      <Dropdown
        content={
          <Menu>
            <Menu.Item
              onClick={() => {
                setSourceModalVisible(true);
              }}
              key="modal"
            >
              {t('select-source')}
            </Menu.Item>
          </Menu>
        }
      >
        <Button type="ghost" size="small" icon="ChevronDown" />
      </Dropdown>
    </Flex>
  );
}

export default function SourceSelectionMenu({
  transformation,
}: {
  transformation: TransformationRead;
}) {
  const mapping = getTransformationMapping(transformation.query);

  if (!mapping) {
    return null;
  }

  return (
    <Flex alignItems="center" gap={4}>
      <Body strong level={2}>
        <SourceMenuTitle mapping={mapping} />
      </Body>
      <SourcesMenu transformation={transformation} />
    </Flex>
  );
}
