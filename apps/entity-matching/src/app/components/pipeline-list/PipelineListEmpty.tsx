import { Body, Flex, Title } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { CreatePipelineButton } from '../create-pipeline-button/CreatePipelineButton';
import { Container, Graphic } from '../InfoBox';

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
