import styled from 'styled-components';

export const StyledError = styled.div`
  display: flex;
  padding: 8px 8px 8px 4px;
  background: #fff3eb;
  align-items: center;
  position: relative;

  i {
    font-size: 20px !important;
    color: #ff9429;
  }

  .message {
    font-size: 12px;
    line-height: 20px;
  }

  .color-overlay {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 4px;
    background: #ff9429;
  }
`;

export const StyledContainer = styled.div`
  *:focus {
    outline: none;
  }

  div {
    background-color: inherit;
  }
`;

export const Centered = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;

export const VerticalAligned = styled.div``;
