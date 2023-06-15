import React, { FunctionComponent, ReactNode } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@extraction-pipelines/common';
import { ExternalLink } from '@extraction-pipelines/components/links/ExternalLink';
import { LEARNING_AND_RESOURCES_URL } from '@extraction-pipelines/pages/Extpipes/Extpipes';

import { Title } from '@cognite/cogs.js';
interface OwnProps {
  actionButton: ReactNode;
}

type Props = OwnProps;

const NoExtpipes: FunctionComponent<Props> = ({ actionButton }) => {
  const { t } = useTranslation();

  return (
    <NoExtpipesWrapper>
      <div css="display: flex; align-items: center; gap: 1rem; margin-top: 3rem; padding: 7rem 5rem; border: 3px dashed #ccc; border-radius: 1rem">
        <div css="display: flex; flex-direction: column; gap: 1rem; max-width: 500px">
          <Title level={4}>{t('no-ext-pipeline-added')}</Title>
          <p>
            {t('no-ext-pipeline-desc')}{' '}
            <ExternalLink href={LEARNING_AND_RESOURCES_URL}>
              {t('documentation', { postProcess: 'lowercase' })}
            </ExternalLink>
          </p>
          {actionButton}
        </div>
      </div>
    </NoExtpipesWrapper>
  );
};

const NoExtpipesWrapper = styled((props) => (
  <div {...props}>{props.children}</div>
))`
  grid-column: 1 / span 3;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default NoExtpipes;
