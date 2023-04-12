import { createLink } from '@cognite/cdf-utilities';
import React from 'react';
import styled from 'styled-components/macro';
import { RootAssetButton } from './RootAssetButton';

export default {
  title: 'Component/RootAssetButton',
  component: RootAssetButton,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

const handleClick = () => {
  window.open(createLink(`/explore/asset/id`, '_blank'));
};

export const Example = () => {
  return <RootAssetButton label="Example" onClick={handleClick} />;
};

export const Ellipsis = () => {
  return <RootAssetButton label="Long root asset" onClick={handleClick} />;
};

const Container = styled.div`
  padding: 20px;
  display: flex;
  position: fixed;
`;
