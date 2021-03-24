import { Button, ButtonProps } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { margin } from 'src/cogs-variables';

type Props = {
  prevBtnProps?: ButtonProps;
  nextBtnProps?: ButtonProps;
  skipBtnProps?: ButtonProps;
};

export function PrevNextNav({
  prevBtnProps,
  nextBtnProps,
  skipBtnProps,
}: Props) {
  return (
    <PrevNextRoot>
      <Button {...prevBtnProps}>{prevBtnProps?.children || 'Back'}</Button>
      <div style={{ flexGrow: 1 }} />
      <Skip>
        {skipBtnProps && (
          <Button {...skipBtnProps}>
            {skipBtnProps?.children || 'Skip processing'}
          </Button>
        )}
      </Skip>
      <Button
        type="primary"
        {...nextBtnProps}
        title={nextBtnProps?.disabled ? 'Upload files to proceed' : ''}
      >
        {nextBtnProps?.children || 'Process files'}
      </Button>
    </PrevNextRoot>
  );
}

const PrevNextRoot = styled.div`
  display: flex;
  padding: 8px;
  background: var(--cogs-white);
  /* Rectangle 2111 */
  box-shadow: 4px 0px 4px 2px rgba(0, 0, 0, 0.1);
`;

const Skip = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${margin.default};
`;
