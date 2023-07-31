import React, { Dispatch, SetStateAction } from 'react';

import { ConfigFormProps } from '../types';

type Props = Omit<ConfigFormProps, 'hasChanges' | 'renderDeleteComponent'> & {
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
  value?: unknown;
  mode: 'EDIT' | 'NEW';
};

export const CreateNewOrUpdateComponent: React.FC<Props> = ({
  opened,
  renderCustomComponent,
  setOpened,
  values,
  valuePath,
  metadataPath,
  onChangeAndUpdate,
  metadataValue,
  value,
  mode,
}) =>
  opened
    ? renderCustomComponent({
        onClose: () => setOpened(false),
        onChangeAndUpdate,
        type: metadataPath,
        metadataValue,
        value,
        mode,
        valuePath,
        values,
      })
    : null;
