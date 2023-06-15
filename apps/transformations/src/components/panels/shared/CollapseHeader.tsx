import { ReactNode } from 'react';

import styled from 'styled-components';

import { Button, Icon, Title } from '@cognite/cogs.js';

type StyledCollapseHeaderProps = {
  header: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  hideButton?: boolean;
};

export const CollapseHeader = ({
  header,
  ariaLabel,
  onClick = () => {},
  hideButton = false,
}: StyledCollapseHeaderProps) => {
  return (
    <Container>
      <Title level={6}>{header}</Title>
      {!hideButton && (
        <StyledEditButton aria-label={ariaLabel} onClick={onClick} />
      )}
    </Container>
  );
};

const StyledEditButton = styled(({ onClick = () => {}, ...props }) => (
  <Button type="ghost" {...props} onClick={onClick}>
    <Icon type="Edit" />
  </Button>
))`
  position: absolute;
  right: 0px;
  top: -4px;
  height: 28px;
  width: 28px;

  && {
    padding: 7px;
  }

  i {
    width: 14px;
    height: 14px;
    margin: 0;
  }
`;

const Container = styled.div`
  min-height: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
`;
