import { FC } from 'react';

import styled from 'styled-components';

import { ToolBar } from '@cognite/cogs.js';
import { withSuppressRevealEvents } from '@cognite/reveal-react-components';

import { FLOATING_ELEMENT_MARGIN } from '../../../pages/ContextualizeEditor/constants';

const AnnotationBoxToolbarContent: FC = () => {
  return (
    <Container>
      <ToolBar direction="horizontal">
        <ToolBar.ButtonGroup
          buttonGroup={[
            {
              icon: 'Edit',
              'aria-label': 'Edit Annotation',
            },
          ]}
        />
        <ToolBar.ButtonGroup
          buttonGroup={[
            {
              icon: 'Exchange',
              'aria-label': 'Change Linked Asset',
            },
          ]}
        />
        <ToolBar.ButtonGroup
          buttonGroup={[
            {
              icon: 'Delete',
              'aria-label': 'Delete annotation',
            },
          ]}
        />
      </ToolBar>
    </Container>
  );
};

export const AnnotationBoxToolbar = withSuppressRevealEvents(
  AnnotationBoxToolbarContent
);

const Container = styled.div`
  position: absolute;
  bottom: ${FLOATING_ELEMENT_MARGIN}px;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  border-radius: 8px;
`;
