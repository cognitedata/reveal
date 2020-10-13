import React from 'react';
import styled from 'styled-components';

import { Loader as CogsLoader } from '@cognite/cogs.js';

const Loader = () => (
  <Wrapper>
    <CogsLoader darkMode={false} />
  </Wrapper>
);

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default Loader;
