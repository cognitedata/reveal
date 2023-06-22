import { useMemo } from 'react';

import { useTranslation } from '@transformations/common';
import { DataModel, useModels } from '@transformations/hooks/fdm';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';

import { Icon } from '@cognite/cogs.js';

import { Column, Item, Label } from './styled-components';
import { Props2 } from './types';

export default function ModelColumn({ mapping, update }: Props2) {
  const { t } = useTranslation();
  const { data, isInitialLoading } = useModels();
  const models = useMemo(() => {
    const models = data?.pages.reduce(
      (accl, p) => [
        ...accl,
        ...p.items.map(({ externalId, space }) => ({ externalId, space })),
      ],
      [] as { externalId: string; space: string }[]
    );
    return uniqWith(models, isEqual).sort((a, b) =>
      a.externalId.localeCompare(b.externalId)
    );
  }, [data]);

  const versions = useMemo(() => {
    const models = data?.pages.reduce(
      (accl, p) => [...accl, ...p.items],
      [] as DataModel[]
    );

    return models?.reduce(
      (accl, m) => ({
        ...accl,
        [`${m.space}.${m.externalId}`]: [
          ...(accl[`${m.space}.${m.externalId}`] || []),
          m.version,
        ],
      }),
      {} as Record<string, string[]>
    );
  }, [data]);

  return (
    <Column $border>
      <Label>{t('standard-data-model', { count: 2 })}</Label>
      <Item
        $active={mapping.sourceType === 'raw'}
        onClick={() =>
          update({
            ...mapping,
            sourceType: 'raw',
            sourceLevel1: undefined,
            sourceLevel2: undefined,
          })
        }
      >
        {t('staging-area')} <Icon type="ChevronRight" />
      </Item>
      <Item
        $active={mapping.sourceType === 'clean'}
        onClick={() =>
          update({
            ...mapping,
            sourceType: 'clean',
            sourceLevel1: undefined,
            sourceLevel2: undefined,
          })
        }
      >
        {t('asset-centric-model')} <Icon type="ChevronRight" />
      </Item>
      <Label>
        {t('custom-data-model', { count: 2 })}
        {isInitialLoading ? <Icon type="Loader" /> : null}
      </Label>
      {models.map((m) => {
        const key = `${m.space}.${m.externalId}`;
        return (
          <Item
            key={key}
            $active={
              key === mapping.sourceLevel1?.split('.').slice(0, 2).join('.')
            }
            onClick={() =>
              update({
                ...mapping,
                sourceType: 'fdm',
                sourceLevel1: `${key}.${versions?.[key]?.[0]}`,
                sourceLevel2: undefined,
              })
            }
          >
            {m.externalId} [{m.space}] <Icon type="ChevronRight" />
          </Item>
        );
      })}
    </Column>
  );
}
