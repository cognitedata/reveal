import * as React from 'react';
import styled from 'styled-components';
import { Button, Title } from '@cognite/cogs.js';

const MarginWrapper = styled.div`
  &:not(:last-child) {
    margin-right: 8px;
  }
`;

const CloseButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <MarginWrapper>
    <Button
      block
      icon="Close"
      type="ghost"
      aria-label="Close"
      onClick={onClick}
    />
  </MarginWrapper>
);

const CommentHeader = styled.div`
  display: flex;
  padding: 16px;
  margin-bottom: 16px;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--cogs-color-strokes-default);
`;

interface Props {
  handleClose: () => void;
}
export const Header: React.FC<Props> = ({ handleClose }) => {
  return (
    <CommentHeader>
      <Title level={5} as="p">
        Comments
      </Title>

      <CloseButton onClick={handleClose} />
    </CommentHeader>
  );
};
