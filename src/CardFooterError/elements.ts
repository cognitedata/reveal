import styled from 'styled-components';

export const StyledCardFooterError = styled.div`
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
