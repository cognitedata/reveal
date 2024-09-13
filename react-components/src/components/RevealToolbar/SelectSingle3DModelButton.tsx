/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement } from 'react';

import { useSDK } from '../RevealCanvas/SDKProvider';
import { RevealContext } from '../RevealContext/RevealContext';
import { type ModelWithRevision } from '../../hooks/types';
import { Single3DModelSelection } from './Single3DModelSelection/SelectSingle3DModelSelection';

type SelectSingle3DModelButtonProps = {
  onSingleModelChanged?: (model: ModelWithRevision | undefined) => void;
};

export const SelectSingle3DModelButton = ({
  onSingleModelChanged
}: SelectSingle3DModelButtonProps): ReactElement => {
  const sdk = useSDK();

  const handleSingleModelChange = (model: ModelWithRevision | undefined): void => {
    if (onSingleModelChanged !== undefined) onSingleModelChanged(model);
  };

  return (
    <RevealContext sdk={sdk}>
      <Single3DModelSelection sdk={sdk} onModelChange={handleSingleModelChange} />
    </RevealContext>
  );
};
