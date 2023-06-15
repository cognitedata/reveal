import { useTranslation } from '@transformations/common';
import { useModel } from '@transformations/hooks/fdm';

import { Icon, Flex } from '@cognite/cogs.js';

import {
  Column,
  Item,
  CenteredColumnContent,
  RotatedIcon,
  Label,
} from './styled-components';
import { Props2 } from './types';

type Props = Props2 & {
  externalId: string;
  space: string;
  version: string;
};
export default function ViewColumn({
  externalId,
  space,
  version,
  mapping,
  update,
}: Props) {
  const { data, isInitialLoading, isSuccess } = useModel(
    externalId,
    space,
    version
  );
  const { t } = useTranslation();

  return (
    <Column>
      <Label>{t('type', { count: 0 })}</Label>
      {isInitialLoading && (
        <CenteredColumnContent>
          <Icon type="Loader" />
        </CenteredColumnContent>
      )}
      {isSuccess && data?.views.length === 0 && (
        <CenteredColumnContent>{t('no-tables-found')}</CenteredColumnContent>
      )}
      {data?.views.map((view) => (
        <Item
          key={view.externalId}
          onClick={() => update({ ...mapping, sourceLevel2: view.externalId })}
          $active={mapping.sourceLevel2 === view.externalId}
        >
          <Flex alignItems="center" gap={8}>
            <RotatedIcon type="SidebarRight" $deg={-90} />
            {view.name || view.externalId}
          </Flex>
          {mapping.sourceLevel2 === view.externalId && (
            <Icon type="Checkmark" />
          )}
        </Item>
      ))}
    </Column>
  );
}
