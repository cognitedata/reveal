import { SecondaryTopbar } from '@cognite/cdf-utilities';
import { Body as _Body, Button, Colors, Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import ResourceSelectionTable from 'components/resource-selector-table';

import styled from 'styled-components';

export default function QuickMatch() {
  const { t } = useTranslation();
  return (
    <Flex direction="column" style={{ height: '100%' }}>
      <SecondaryTopbar title={t('quick-match')} />
      <Body>
        <ResourceSelectionTable />
      </Body>
      <BottomRow justifyContent="space-between">
        <Button>TODO</Button>
        <Button type="primary">TODO</Button>
      </BottomRow>
    </Flex>
  );
}

const BottomRow = styled(Flex)`
  padding: 8px;
`;

const Body = styled(_Body)`
  flex-grow: 1;
  border-top: 1px solid ${Colors['border--muted']};
  border-bottom: 1px solid ${Colors['border--muted']};
`;
