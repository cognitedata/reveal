import styled from 'styled-components/macro';
import layers from 'utils/zindex';

export const SelectorWrapper = styled.div`
  z-index: ${layers.FILTER_BOX};
  border: ${(props: { showOutline: boolean }) =>
    props.showOutline ? '1px solid #d9d9d9' : 'unset'};
  padding: 5px;
  border-radius: 5px;
  width: fit-content;
`;
