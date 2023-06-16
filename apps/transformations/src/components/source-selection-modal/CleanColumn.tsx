import { useTranslation } from '@transformations/common';

import { Flex, Icon } from '@cognite/cogs.js';

import { Column, Item, Label } from './styled-components';
import { Props2 } from './types';

export default function CleanColumn({ mapping, update }: Props2) {
  const { t } = useTranslation();
  const sources = [
    {
      mapping: {
        sourceType: 'clean' as const,
        sourceLevel1: '_cdf',
        sourceLevel2: 'assets',
      },
      key: 'assets',
      label: t('source-menu-clean-assets'),
      icon: 'Assets' as const,
    },
    {
      mapping: {
        sourceType: 'clean' as const,
        sourceLevel1: '_cdf',
        sourceLevel2: 'events',
      },
      key: 'events',
      label: t('source-menu-clean-events'),
      icon: 'Events' as const,
    },
    {
      mapping: {
        sourceType: 'clean' as const,
        sourceLevel1: '_cdf',
        sourceLevel2: 'files',
      },
      key: 'files',
      label: t('source-menu-clean-files'),
      icon: 'Document' as const,
    },
    {
      mapping: {
        sourceType: 'clean' as const,
        sourceLevel1: '_cdf',
        sourceLevel2: 'labels',
      },
      key: 'labels',
      label: t('source-menu-clean-labels'),
      icon: 'Tag' as const,
    },
    {
      mapping: {
        sourceType: 'clean' as const,
        sourceLevel1: '_cdf',
        sourceLevel2: 'sequences',
      },
      key: 'sequences',
      label: t('source-menu-clean-sequences'),
      icon: 'Sequences' as const,
    },
    {
      mapping: {
        sourceType: 'clean' as const,
        sourceLevel1: '_cdf',
        sourceLevel2: 'timeseries',
      },
      key: 'timeseries',
      label: t('source-menu-clean-timeseries'),
      icon: 'Timeseries' as const,
    },
  ];

  return (
    <Column $border>
      <Label>{t('resource-types')}</Label>
      {sources.map((s) => (
        <Item
          $active={
            s.mapping.sourceLevel1 === mapping.sourceLevel1 &&
            s.mapping.sourceLevel2 === mapping.sourceLevel2
          }
          onClick={() => update({ ...mapping, ...s.mapping })}
          key={s.key}
        >
          <Flex alignItems="center" gap={8}>
            <Icon type={s.icon} />
            {s.label}
          </Flex>
          {s.mapping.sourceLevel1 === mapping.sourceLevel1 &&
            s.mapping.sourceLevel2 === mapping.sourceLevel2 && (
              <Icon type="Checkmark" />
            )}
        </Item>
      ))}
    </Column>
  );
}
