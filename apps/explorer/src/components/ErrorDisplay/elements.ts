import styled from 'styled-components';
import { sizes } from 'styles/layout';

export const ErrorHeader = styled.header`
  font-size: 22px;
  color: #ba3939;
  background: #ffe0e0;
  border: 1px solid #a33a3a;
  padding: 10px;
  margin: 10px;
`;

export const ErrorBody = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;
export const MarginWrapper = styled.div`
  margin: ${sizes.normal};
`;
