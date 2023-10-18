import React from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { createLink } from '@cognite/cdf-utilities';
import { Button } from '@cognite/cogs.js';

import { useFiles } from '../../../../hooks/files/useFiles';

export const FILE_NOT_FOUND_ERROR = 'File not found';
export const RESTRICTED_FILE_ERROR = 'Insufficient access rights';

export const FileLink = ({ fileId }: { fileId: number }) => {
  const navigate = useNavigate();
  const file = useFiles([fileId]);

  const onClickFile = () => {
    navigate(
      createLink(`/explore/search/file`, {
        journey: `file-${fileId}`,
        'full-page': true,
        'selected-tab': 'info',
      })
    );
  };

  if (file.error) {
    if (file.error.status === 400) {
      return <>{FILE_NOT_FOUND_ERROR} </>;
    }
    if (file.error.status === 403) {
      return <>{RESTRICTED_FILE_ERROR} </>;
    }
  }

  if (file.data) {
    return (
      <ViewFileButton size="small" type="secondary" onClick={onClickFile}>
        {file.data[0].name}
      </ViewFileButton>
    );
  }

  return null;
};

const ViewFileButton = styled(Button)`
  font-size: 12px;
`;
