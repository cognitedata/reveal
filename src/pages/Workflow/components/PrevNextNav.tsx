import { useUploadedFilesCount } from 'src/store/hooks/useUploadedFilesCount';
import { Button, ButtonProps } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { margin } from 'src/cogs-variables';

type Props = {
  prevBtnProps?: ButtonProps;
  nextBtnProps?: ButtonProps;
};

export function PrevNextNav({ prevBtnProps, nextBtnProps }: Props) {
  const { countStr } = useUploadedFilesCount();
  return (
    <PrevNextRoot>
      <Button {...prevBtnProps}>{prevBtnProps?.children || 'Back'}</Button>

      <div style={{ flexGrow: 1 }} />

      <FilesCount>{countStr}</FilesCount>
      <Button type="primary" {...nextBtnProps}>
        {nextBtnProps?.children || 'Next'}
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
