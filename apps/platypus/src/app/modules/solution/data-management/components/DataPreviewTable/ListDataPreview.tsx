import { Button, Flex, Title } from '@cognite/cogs.js';
import { MouseEventHandler } from 'react';
import styled from 'styled-components';

type ListDataPreviewProps = {
  title: React.ReactNode;
  onCloseClick: MouseEventHandler<HTMLButtonElement>;
};

export const ListDataPreview = ({
  title,
  onCloseClick,
}: ListDataPreviewProps) => {
  return (
    <StyledListDataContainer>
      <Flex
        style={{ padding: '6px 2px 6px 14px' }}
        justifyContent="space-between"
        alignItems="center"
      >
        <Title level={6}>{title}</Title>
        <Button icon="CloseLarge" type="ghost" onClick={onCloseClick}></Button>
      </Flex>
    </StyledListDataContainer>
  );
};

const StyledListDataContainer = styled('div')`
  padding: 0 8px;
`;
