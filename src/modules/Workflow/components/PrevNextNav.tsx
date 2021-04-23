import { Button, ButtonProps } from '@cognite/cogs.js';
import { Modal } from 'antd';

import React from 'react';
import styled from 'styled-components';
import { margin } from 'src/cogs-variables';
import { useHistory } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';

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
  const history = useHistory();
  const handleonSkipClick = () => {
    Modal.confirm({
      title: 'Just so you know',
      content:
        'By skipping processing you will be taken back to the home page. Your files are uploaded to Cognite Data Fusion and can be processed later.',
      onOk: () => {
        history.push(createLink('/explore/search/file'));
      },
    });
  };
  return (
    <PrevNextRoot>
      <Button {...prevBtnProps}>{prevBtnProps?.children || 'Back'}</Button>
      <div style={{ flexGrow: 1 }} />
      <Skip>
        {skipBtnProps && (
          <Button {...skipBtnProps} onClick={handleonSkipClick}>
            {skipBtnProps?.children || 'Skip processing'}
          </Button>
        )}
      </Skip>
      <Button type="primary" {...nextBtnProps}>
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
