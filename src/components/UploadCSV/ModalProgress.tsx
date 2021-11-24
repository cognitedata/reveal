import React from 'react';
import { Progress } from 'antd';
import styled from 'styled-components';

type Props = {
  isUploadFinished: boolean;
  parsePercentage: number;
  uploadPercentage: number;
  uploadSize: number;
};

export const ModalProgress = (props: Props): JSX.Element => {
  const { isUploadFinished, parsePercentage, uploadPercentage, uploadSize } =
    props;
  const text = isUploadFinished ? 'Uploading finished!' : 'Uploading csv...';

  return (
    <Wrapper>
      <p>{text}</p>
      <Progress
        type="line"
        percent={parsePercentage}
        success={{ percent: uploadPercentage }}
        format={() => `${uploadSize}MB`}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
