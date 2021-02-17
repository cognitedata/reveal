import { useUploadedFilesCount } from 'src/store/hooks/useUploadedFilesCount';
import { Button } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { margin } from 'src/cogs-variables';

type ClickHandler = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>['onClick'];

type Props = {
  titleNext?: string;
  disableNext?: boolean;
  onPrevClicked?: ClickHandler;
  onNextClicked?: ClickHandler;
};

export function PrevNextNav({
  titleNext,
  disableNext,
  onPrevClicked,
  onNextClicked,
}: Props) {
  const { countStr } = useUploadedFilesCount();
  return (
    <PrevNextRoot>
      <Button onClick={onPrevClicked}>Prev</Button>

      <div style={{ flexGrow: 1 }} />

      <FilesCount>{countStr}</FilesCount>
      <Button type="primary" disabled={disableNext} onClick={onNextClicked}>
        {titleNext || 'Next'}
      </Button>
    </PrevNextRoot>
  );
}

const PrevNextRoot = styled.div`
  display: flex;

  padding: 8px;
  background: var(--cogs-white);
`;

const FilesCount = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${margin.default};
  font-weight: 500;
`;
