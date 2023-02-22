import { Flex, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common';
import graphics from 'common/assets/graphics';

const PipelineListEmpty = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Container direction="row">
      <Flex direction="column" alignItems="flex-start">
        <Title level={4}>{t('pipeline-list-empty-title')}</Title>
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
