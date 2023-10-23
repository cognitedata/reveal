import React, { useState } from 'react';

import styled from 'styled-components';

import noop from 'lodash/noop';

import { Button } from '../../Components/Button';
import { Colors } from '../../Components/Colors';

type HtmlElementProps = React.HTMLAttributes<HTMLButtonElement>;

export interface DropdownProps extends HtmlElementProps {
  label?: string;
  content: any;
  title?: string;
  visible?: boolean;
  visibleOnHover?: boolean;
}

export const Dropdown = (props: DropdownProps) => {
  const {
    label = 'Select',
    title,
    content,
    visible = false,
    visibleOnHover = true,
  } = props;
  const [isVisible, setVisibleStatus] = useState<boolean>(visible);

  return (
    <Container
      onMouseEnter={visibleOnHover ? () => setVisibleStatus(true) : noop}
      onMouseLeave={visibleOnHover ? () => setVisibleStatus(false) : noop}
    >
      <Header>
        <Button
          type="link"
          icon="Dropdown"
          iconPlacement="right"
          style={{
            cursor: 'default',
          }}
          onClick={() => {
            setVisibleStatus(true);
          }}
        >
          {label}
        </Button>
      </Header>
      {isVisible && (
        <ContentContainer>
          {title && <Title>{title}</Title>}
          {content}
        </ContentContainer>
      )}
    </Container>
  );
};

const Container = styled('div')`
  background: ${Colors['white']};
`;

const Header = styled('div')`
  background: inherit;
`;

const Title = styled('div')`
  padding: 8px 12px 8px 8px;
  margin-top: 4px;
  color: ${Colors['greyscale-grey6']};
  font-size: 12px;
  font-weight: 400;
  text-align: left;
`;

const ContentContainer = styled('div')`
  position: absolute;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  background: white;
  border-radius: 8px;
  box-shadow: ${Colors['box-shadow']};
`;
