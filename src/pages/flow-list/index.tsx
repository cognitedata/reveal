import { Body, Button, Flex, Icon, Title } from '@cognite/cogs.js';
import List from './List';
import styled from 'styled-components';
import { useTranslation } from 'common';
import SearchInput from './SearchInput';
import Count from './Count';
import { useState } from 'react';
import { CreateWorkflowModal } from 'components/workflow-modal/CreateWorkflowModal';

export default function FlowList() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ListLayoutWrapper direction="column">
        <Flex justifyContent="space-between" style={{ marginBottom: 8 }}>
          <Flex gap={10} alignItems="center">
            <Icon type="FlowChart" />
            <Title level={3}>{t('list-title')}</Title>
          </Flex>
          <Button onClick={() => setIsModalOpen(true)} type="primary">
            {t('list-create-flow')}
          </Button>
        </Flex>

        <Body level={2}>{t('list-description')}</Body>
        <Flex style={{ margin: '30px 0' }} alignItems="center" gap={10}>
          <SearchInput />
          <Count />
        </Flex>
        <List />
      </ListLayoutWrapper>
      <CreateWorkflowModal
        onCancel={() => setIsModalOpen(false)}
        visible={isModalOpen}
      />
    </>
  );
}

const ListLayoutWrapper = styled(Flex)`
  width: 1096px;
  margin: 50px auto;
  h1 {
    margin: 0;
  }
`;
