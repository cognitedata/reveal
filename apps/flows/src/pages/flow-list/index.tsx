import { useMemo, useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@flows/common';
import { BasicPlaceholder } from '@flows/components/basic-placeholder/BasicPlaceholder';
import { CreateWorkflowModal } from '@flows/components/workflow-modal/CreateWorkflowModal';
import WorkflowTable from '@flows/components/workflow-table/WorkflowTable';
import { useWorkflows } from '@flows/hooks/workflows';

import {
  Body,
  Button,
  Flex,
  Icon,
  Input,
  Loader,
  Title,
} from '@cognite/cogs.js';

export default function FlowList() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: workflows,
    error,
    isInitialLoading: isInitialLoadingWorkflows,
  } = useWorkflows();

  const filteredWorkflows = useMemo(
    () =>
      workflows?.filter(({ externalId, description }) => {
        const lowercaseQuery = searchQuery.toLowerCase();
        return (
          externalId.toLowerCase().includes(lowercaseQuery) ||
          description?.toLowerCase().includes(lowercaseQuery)
        );
      }) ?? [],
    [workflows, searchQuery]
  );

  if (isInitialLoadingWorkflows) return <Loader />;

  if (error || !workflows)
    return (
      <BasicPlaceholder
        type="EmptyStateFolderSad"
        title={t('error-workflow', { count: 0 })}
      >
        <Body level={5}>{JSON.stringify(error)}</Body>
      </BasicPlaceholder>
    );

  return (
    <>
      <ListLayoutWrapper>
        <Flex justifyContent="space-between" style={{ marginBottom: 8 }}>
          <Flex gap={10} alignItems="center">
            <Icon type="FlowChart" />
            <Title level={3}>{t('list-title')}</Title>
          </Flex>
        </Flex>
        <Flex alignItems="center" justifyContent="space-between" gap={12}>
          <Flex alignItems="center" gap={12}>
            <Input
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('list-search-placeholder')}
              value={searchQuery}
            />
            <Body level={2} muted>
              {t('workflow_other', { count: filteredWorkflows.length })}
            </Body>
          </Flex>
          <Button onClick={() => setIsModalOpen(true)} type="primary">
            {t('create-workflow')}
          </Button>
        </Flex>
        <WorkflowTable workflows={filteredWorkflows} />
      </ListLayoutWrapper>
      <CreateWorkflowModal
        onCancel={() => setIsModalOpen(false)}
        visible={isModalOpen}
      />
    </>
  );
}

const ListLayoutWrapper = styled.div`
  width: 1096px;
  margin: 50px auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
