import styled from 'styled-components';

export type onResourceSelectedParams = {
  assetId?: number;
  fileId?: number;
  timeseriesId?: number;
};

export const Wrapper = styled.div`
  width: 100%;
  .back-button {
    margin-bottom: 12px;
  }
  .ant-collapse {
    margin-bottom: 12px;
  }

  .button-row {
    & > * {
      margin-right: 6px;
      margin-bottom: 6px;
      display: inline-flex;
    }
    & > *:nth-last-child(1) {
      margin-left: 0px;
    }
  }
`;
