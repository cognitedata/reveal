import * as React from 'react';

import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';

const ShowStatusWrapper = styled.div`
  margin: 15px;
`;

export const ShowStatus: React.FC<{ status?: boolean }> = ({ status }) => {
  return (
    <ShowStatusWrapper>
      {status === true && (
        <Icon type="CheckmarkFilled" style={{ color: '#18AF8E' }} />
      )}
      {status === false && (
        <Icon type="ErrorFilled" style={{ color: '#D51A46' }} />
      )}
    </ShowStatusWrapper>
  );
};
