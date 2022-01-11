import React, { Dispatch, SetStateAction } from 'react';

import { ConfigFormProps } from '../types';

type Props = Omit<
  ConfigFormProps,
  'hasChanges' | 'onDelete' | 'renderDeleteComponent'
> & {
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
};

export const CreateNewComponent: React.FC<Props> = ({
  opened,
  renderCustomComponent,
  setOpened,
  value,
  valuePath,
  metadataPath,
  onChange,
  metadataValue,
}) =>
  opened
    ? renderCustomComponent({
        onClose: () => setOpened(false),
        onOk: (datum: unknown) => {
          if (value) {
            onChange(valuePath, [...(value as []), datum]);
          } else {
            onChange(valuePath, [datum]);
          }
        },
        type: metadataPath,
        metadataValue,
      })
    : null;
