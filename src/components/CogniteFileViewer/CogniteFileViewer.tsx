import React from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

import sdk from 'sdk-singleton';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { FilePreview } from '../FileView';

const Wrapper = styled.div`
  flex: 1;
  min-height: 200px;
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;

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
    <CogniteFileViewer.Provider sdk={sdk}>
      <Wrapper>
        <div
          style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <FilePreview fileId={fileId!} editMode={editMode} />
        </div>
      </Wrapper>
    </CogniteFileViewer.Provider>
  );
};
