import * as React from 'react';

import { BaseButton } from 'components/Buttons';
import { BaseButtonProps } from 'components/Buttons/types';

const BaseToggleHighlightButton: React.FC<BaseButtonProps> = (props) => {
  return <BaseButton size="small" type={undefined} {...props} />;
};

export const HighlightButton: React.FC<BaseButtonProps> = (props) => {
  return (
    <BaseToggleHighlightButton
      {...props}
      toggled
      text="Highlight"
      tooltip="Add to summary"
    />
  );
};

export const RemoveButton: React.FC<BaseButtonProps> = (props) => {
  return (
    <BaseToggleHighlightButton
      {...props}
      toggled={false}
      text="Remove"
      tooltip="Remove from summary"
    />
  );
};
