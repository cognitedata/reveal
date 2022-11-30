import styled from 'styled-components';

export const RightWrapper = styled.div`
  position: absolute;
  left: 101%;
  background: white;
  top: 0;
  width: 400px;
  box-shadow: var(--cogs-z-8);
`;

export const AttributeWrapper = styled.div`
  display: flex;
  align-items: center;
  background: #fafafa;
  margin-bottom: 8px;
  padding: 8px 10px;
  .attribute-extractor-detail {
    font-size: 11px;
  }
  .details {
    flex-grow: 1;
    padding: 0 8px;
  }
`;

export const AttributeFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  .attribute-name-type-inputs {
    gap: 16px;
    .attribute-name-input {
      width: 60%;
    }
    .cogs-select {
      width: 40%;
      display: block;
    }
  }
`;
