import { Body, Flex, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common';
import graphics from 'common/assets/graphics';
import { CreatePipelineButton } from 'components/create-pipeline-button/CreatePipelineButton';
import { createLink } from '@cognite/cdf-utilities';
import { useParams, Link } from 'react-router-dom';
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

const Container = styled(Flex)`
  width: 80%;
  max-width: 1088px;
  padding: 150px;
  margin: 0 auto;
  box-sizing: border-box;
  border: 2px dashed rgba(0, 0, 0, 0.15);
  border-radius: 16px;

  *:not(:last-child) {
    margin-bottom: 16px;
  }
`;

const Graphic = styled.img.attrs({ src: graphics.TemplateGraphic })`
  margin-left: 40px;
`;

export default PipelineListEmpty;
