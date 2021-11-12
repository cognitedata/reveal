import React, { FunctionComponent, ReactNode } from 'react';
import { A, Graphic, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { LEARNING_AND_RESOURCES_URL } from 'pages/Extpipes/Extpipes';

const NoExtpipesWrapper = styled((props) => (
  <div {...props}>{props.children}</div>
))`
  grid-column: 1 / span 3;

  display: flex;
  flex-direction: column;
  align-items: center;
`;
interface OwnProps {
  actionButton: ReactNode;
}

type Props = OwnProps;

const NoExtpipes: FunctionComponent<Props> = ({ actionButton }) => {
  return (
    <NoExtpipesWrapper>
      <div css="display: flex; align-items: center; gap: 1rem; margin-top: 3rem; padding: 7rem 5rem; border: 3px dashed #ccc; border-radius: 1rem">
        <div css="display: flex; flex-direction: column; gap: 1rem; max-width: 500px">
          <Title level={4}>No extraction pipelines have been added yet.</Title>
          <p>
            Use this section to create and monitor data flows. Learn more about
            extraction pipelines in{' '}
            <A href={LEARNING_AND_RESOURCES_URL}>documentation</A>.
          </p>
          {actionButton}
        </div>
        <Graphic type="RuleMonitoring" style={{ width: 150 }} />
      </div>
    </NoExtpipesWrapper>
  );
};

export default NoExtpipes;
