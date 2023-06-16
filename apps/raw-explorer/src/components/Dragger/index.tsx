import React from 'react';

import styled from 'styled-components';

import { Upload, UploadProps } from 'antd';

import { Colors } from '@cognite/cogs.js';

const { Dragger: AntdDragger } = Upload;

const Dragger = (props: UploadProps): JSX.Element => {
  return <StyledDragger {...props} />;
};

export default Dragger;

const StyledDragger = styled(AntdDragger)`
  && {
    border: 2px dashed ${Colors['border--muted']};
    border-radius: 7px;
    box-sizing: border-box;
    width: 100%;
    transition: 0.3s;

    &:hover {
      border: 2px dashed ${Colors['border--interactive--hover']};
      background-color: ${Colors['surface--interactive--toggled-hover']};
    }

    .ant-upload-btn {
      padding: 36px;
      box-sizing: border-box;
    }
  }
`;
