import styled from 'styled-components';

import { sizes } from '../../elements';

export const Wrapper = styled.div`
  justify-content: flex-end;
  margin-top: ${sizes.normal};
  margin-right: ${sizes.normal};
  position: absolute;
  z-index: ${(props: { zIndex?: number }) =>
    props.zIndex === undefined ? 5 : props.zIndex};
  display: flex;
  right: 0;
  width: 100%;
  padding-right: ${sizes.small};
  padding-left: ${sizes.normal};

  > div {
    margin-right: ${sizes.small};
    white-space: nowrap;
  }

  > div.isHidden {
    opacity: 0;
    pointer-events: none;
  }
`;
