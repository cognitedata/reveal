/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement } from 'react';

import { useSDK } from '../RevealCanvas/SDKProvider';
import { type ModelWithRevision, type SingleModelIds } from '../../hooks/types';
import { Single3DModelSelection } from './Single3DModelSelection/SelectSingle3DModelSelection';
import { type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';

type SelectSingle3DModelButtonProps = {
  onSingleModelChanged?: (model: ModelWithRevision | undefined) => void;
  selectedResource?: DmsUniqueIdentifier | SingleModelIds | undefined;
};

export const SelectSingle3DModelButton = ({
  onSingleModelChanged,
  selectedResource
}: SelectSingle3DModelButtonProps): ReactElement => {
  const sdk = useSDK();

  const handleSingleModelChange = (model: ModelWithRevision | undefined): void => {
    if (onSingleModelChanged !== undefined) onSingleModelChanged(model);
  };

  return (
    <Single3DModelSelection
      selectedResource={selectedResource}
      sdk={sdk}
      onModelChange={handleSingleModelChange}
    />
  );
};
