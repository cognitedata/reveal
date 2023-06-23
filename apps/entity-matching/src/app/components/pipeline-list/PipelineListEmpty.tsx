import { useTranslation } from '@entity-matching-app/common';

import { Body, Flex, Title } from '@cognite/cogs.js';

import { CreatePipelineButton } from '@entity-matching-app/components/create-pipeline-button/CreatePipelineButton';
import { Container, Graphic } from '@entity-matching-app/components/InfoBox';

const PipelineListEmpty = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Container direction="row" justifyContent="space-between">
      <Flex direction="column" alignItems="flex-start">
        <Title level={4}>{t('pipeline-list-empty-title')}</Title>
        <Body level={1}>{t('pipeline-list-empty-description')}</Body>
        <CreatePipelineButton />
      </Flex>
      <Graphic />
    </Container>
  );
};

export default PipelineListEmpty;
