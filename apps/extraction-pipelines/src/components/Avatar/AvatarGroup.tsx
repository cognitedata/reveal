import React, { FunctionComponent, PropsWithChildren } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: inline-flex;
  span {
    position: relative;
  }
  span:not(:first-child) {
    margin-left: -0.75rem;
  }
`;
interface OwnProps {}

type Props = OwnProps;

const AvatarGroup: FunctionComponent<PropsWithChildren<Props>> = (
  props: PropsWithChildren<Props>
) => {
  return <Wrapper>{props.children}</Wrapper>;
};

export default AvatarGroup;
