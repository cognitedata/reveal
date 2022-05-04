import styled from 'styled-components/macro';

export const Container = styled.div`
  padding: 20px;
`;

export const SourceItemWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  margin: 5px 0;
  max-width: 260px;
`;

export const SourceItemName = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const HistogramWrapper = styled.div`
  padding: 5px;
`;
