import { useMemo } from 'react';

import { useTranslation } from '@transformations/common';
import { useModels } from '@transformations/hooks/fdm';
import { collectPages } from '@transformations/utils';

import { Icon } from '@cognite/cogs.js';

import {
  CenteredColumnContent,
  Column,
  Item,
  Label,
} from './styled-components';
import { Props2 } from './types';

type Props = Props2 & {
  space: string;
  externalId: string;
};
export default function DMSVersionColumn({
  mapping,
  update,
  space,
  externalId,
}: Props) {
  const { t } = useTranslation();
  const { data, isInitialLoading, isSuccess } = useModels();
  const versions = useMemo(
    () =>
      collectPages(data)
        .filter((m) => m.externalId === externalId && m.space === space)
        .map((m) => m.version)
        .sort(),
    [data, externalId, space]
  );
  const [currentSpace, currentExternalId, currentVersion] =
    mapping.sourceLevel1?.split('.') || [];

  return (
    <Column $border>
      {isInitialLoading && (
        <CenteredColumnContent>
          <Icon type="Loader" />
        </CenteredColumnContent>
      )}
      {isSuccess && versions?.length === 0 && (
        <CenteredColumnContent>{t('no-versions-found')}</CenteredColumnContent>
      )}
      <Label key="version-label">{t('fdm-version')}</Label>
      {versions?.map((v) => (
        <Item
          key={v}
          $active={
            space === currentSpace &&
            externalId === currentExternalId &&
            v === currentVersion
          }
          onClick={() =>
            update({
              ...mapping,
              sourceLevel1: `${space}.${externalId}.${v}`,
              sourceLevel2: undefined,
            })
          }
        >
          {v}
          <Icon type="ChevronRight" />
        </Item>
      ))}
    </Column>
  );
}
