import React from 'react';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';

import { Text } from './index';

const ErrorMsg = () => {
  const { hash } = window.location;

  const params = hash.split('&').reduce<Record<string, string>>((res, item) => {
    const parts = item.split('=');
    res[parts[0]] = decodeURIComponent(parts[1] as string).replace(/\+/g, ' ');
    return res;
  }, {});

  return (
    <div>
      <Tippy
        interactive
        content={params.error_description}
        placement="bottom"
        trigger="click"
      >
        <ErrorWrapper>
          <Text color="red">
            There was an error logging you in. Click this message to see more
            details.
          </Text>
        </ErrorWrapper>
      </Tippy>
    </div>
  );
};

const ErrorWrapper = styled.div`
  background-color: #ff000011;
  padding: 10px;
  border-radius: 3px;
  cursor: pointer;
`;

export default ErrorMsg;
