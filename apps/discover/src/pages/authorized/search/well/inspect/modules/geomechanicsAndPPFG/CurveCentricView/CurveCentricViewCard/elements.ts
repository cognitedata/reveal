import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

export const CurveCentricViewCardWrapper = styled.div`
  border-radius: ${sizes.small};
  flex: 1 1 50%;
  box-sizing: border-box;
  max-width: calc(50% - ${sizes.small});
  display: ${(props: { visible: boolean }) =>
    props.visible ? 'initial' : 'none'};
`;
