import styled from 'styled-components';
import layers from 'utils/zindex';

export const Wrapper = styled.div`
  z-index: ${layers.SELECTED_ANNOTATION};
  padding: 20px;
  background-color: white;
  width: 300px;
  & > a {
    margin-top: 10px;
    display: block;
    text-decoration: none;
    background-color: var(--cogs-greyscale-grey4);
    padding: 5px;
    text-align: center;
    color: var(--cogs-text-color);
    font-weight: 500;
  }
`;

export const CloseButton = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  & > button {
    padding: 10px;
    cursor: pointer;
    color: var(--cogs-border-default);
  }
`;
