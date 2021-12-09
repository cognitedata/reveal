import React from 'react';
import { Upload, UploadProps } from 'antd';
import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

const { Dragger: AntdDragger } = Upload;

const Dragger = (props: UploadProps): JSX.Element => {
  return <StyledDragger {...props} />;
};

export default Dragger;

const StyledDragger = styled(AntdDragger)`
  && {
    border: 2px dashed ${Colors['greyscale-grey4'].hex()};
    border-radius: 7px;
    box-sizing: border-box;
    width: 100%;
    transition: 0.3s;

    &:hover {
      border: 2px dashed ${Colors['midblue'].hex()};
      background-color: ${Colors['bg-control--toggled-hover'].hex()};
    }

    .ant-upload-btn {
      padding: 36px;
      box-sizing: border-box;
    }
  }
`;
