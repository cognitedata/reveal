import React from 'react';
import styled from 'styled-components';
import { CogniteAnnotation } from '@cognite/annotations';
import { ProposedCogniteAnnotation } from '@cognite/react-picture-annotation';
import { Body, Colors, Detail } from '@cognite/cogs.js';

type Props = {
  annotation: Array<CogniteAnnotation | ProposedCogniteAnnotation>;
};

export const AnnotationHoverPreview = (props: Props) => {
  const { annotation } = props;
  return (
    <Wrapper>
      {annotation[0]?.status === 'unhandled' && <NewLabel strong>New</NewLabel>}
      <Body
        level={2}
        strong
        style={{
          color: Colors.white.hex(),
        }}
      >
        {annotation[0]?.label?.length ? annotation[0]?.label : 'N/A'}
      </Body>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: ${Colors['greyscale-grey10'].hex()};
  border-radius: 6px;
  padding: 6px;
`;
const NewLabel = styled(Detail)`
  background-color: ${Colors['midblue-6'].hex()};
  color: ${Colors['midblue-2'].hex()};
  border-radius: 4px;
  padding: 2px 6px;
  margin-right: 8px;
`;
