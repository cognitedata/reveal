import React from 'react';
import styled from 'styled-components';

import { Loader as CogsLoader } from '@cognite/cogs.js';

const propTypes = {};

const defaultProps = {};

const Wrapper = styled.div`
  background: black;
  height: 100vh;
`;

const Loader = () => (
  <Wrapper>
    <CogsLoader width={360} />
  </Wrapper>
);

Loader.propTypes = propTypes;
Loader.defaultProps = defaultProps;

export default Loader;
