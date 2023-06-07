import React from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

import { FilePreview } from '../FileView';

const Wrapper = styled.div`
  flex: 1;
  min-height: 200px;
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  background-color: ${Colors['greyscale-grey2'].hex()};
  background-image: radial-gradient(
    ${Colors['greyscale-grey4'].hex()} 10%,
    transparent 10%
  );
  background-position: 0 0, 10px 10px;
  background-size: 20px 20px;
  button.cogs-menu-item {
    color: ${Colors.black.hex()};
  }
`;

type Props = {
  fileId?: number;
  editMode: boolean;
};

export const ContextFileViewer = ({ fileId, editMode }: Props) => {
  return (
    <Wrapper>
      <FilePreview fileId={fileId!} editMode={editMode} />
    </Wrapper>
  );
};
