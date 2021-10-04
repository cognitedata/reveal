import React from 'react';
import styled from 'styled-components';
import { Colors, Icon, Body } from '@cognite/cogs.js';
import { Flex } from './Flex';

const BoldText = styled.span`
  font-weight: bolder;
`;
const Wrapper = styled(Flex)`
  padding: 16px;
  border: 1px solid ${Colors['greyscale-grey2'].hex()};
  border-radius: 4px;
`;

type Props = { content: React.ReactNode; title?: string };

export const Disclosure = (props: Props) => {
  const { title, content } = props;
  return (
    <Wrapper row>
      <Body level={2}>
        <BoldText>
          <Icon
            type="Warning"
            className="em-icon"
            style={{ color: Colors['yellow-3'].hex(), marginRight: '4px' }}
          />
          {title ?? 'Disclaimer'}
        </BoldText>
        {content}
      </Body>
    </Wrapper>
  );
};
