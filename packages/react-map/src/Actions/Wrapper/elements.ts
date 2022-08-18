import styled from 'styled-components';

import { sizes } from '../../elements';

export const Wrapper = styled.div`
  justify-content: flex-end;
  position: absolute;
  z-index: ${(props: { zIndex?: number; ref: any }) =>
    props.zIndex === undefined ? 5 : props.zIndex};
  display: flex;
  right: 0;
  width: 100%;

  // perhaps should consider removing these styles from this wrapper
  // or making them configurable
  margin-top: ${sizes.normal};
  padding-left: ${sizes.normal};
  padding-right: ${sizes.small};

  > div {
    margin-right: ${sizes.small};
    white-space: nowrap;
  }

  > div.isHidden {
    opacity: 0;
    pointer-events: none;
  }
`;
