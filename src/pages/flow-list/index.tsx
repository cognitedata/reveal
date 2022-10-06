import { Body, Flex, Icon, Title } from '@cognite/cogs.js';
import RawSetupCheck from './SetupCheck';
import List from './List';
import CreateButton from './CreateButton';
import styled from 'styled-components';
import { useTranslation } from 'common';
import SearchInput from './SearchInput';
import Count from './Count';

export default function FlowList() {
  const { t } = useTranslation();
  return (
    <RawSetupCheck>
      <ListLayoutWrapper direction="column">
        <Flex justifyContent="space-between" style={{ marginBottom: 8 }}>
          <Flex gap={10} alignItems="center">
            <Icon type="FlowChart" />
            <Title level={3}>{t('list-title')}</Title>
          </Flex>

          <CreateButton />
        </Flex>

        <Body level={2}>{t('list-description')}</Body>
        <Flex style={{ margin: '30px 0' }} alignItems="center" gap={10}>
          <SearchInput />
          <Count />
        </Flex>
        <List />
      </ListLayoutWrapper>
    </RawSetupCheck>
  );
}

const ListLayoutWrapper = styled(Flex)`
  width: 1096px;
  margin: 50px auto;
  h1 {
    margin: 0;
  }
`;
