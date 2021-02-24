import styled from 'styled-components';

export type onResourceSelectedParams = {
  assetId?: number;
  fileId?: number;
  timeseriesId?: number;
};

export const Wrapper = styled.div`
  .back-button {
    margin-bottom: 12px;
  }
  .ant-collapse {
    margin-bottom: 12px;
  }
`;
