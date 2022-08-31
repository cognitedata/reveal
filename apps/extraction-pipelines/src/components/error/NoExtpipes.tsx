import React, { FunctionComponent, ReactNode } from 'react';
import { Graphic, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { LEARNING_AND_RESOURCES_URL } from 'pages/Extpipes/Extpipes';
import { ExternalLink } from 'components/links/ExternalLink';
import { useTranslation } from 'common';
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
        <Graphic type="RuleMonitoring" style={{ width: 150 }} />
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
