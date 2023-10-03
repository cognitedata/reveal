import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import { InputExp, ToolBar } from '@cognite/cogs.js';

type LabelToolbarProps = {
  initialValue: string | undefined;
  onSave: (nextLabel: string) => void;
  onClose: () => void;
};

const LabelToolbar: React.FC<LabelToolbarProps> = ({
  initialValue,
  onSave,
  onClose,
}) => {
  const [inputRef, setInputRef] = React.useState<HTMLInputElement | null>(null);
  const [localLabel, setLocalLabel] = useState<string>(initialValue ?? '');

  useEffect(() => {
    if (inputRef === null) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onSave(localLabel);
      }

      if (e.key === 'Escape') {
        onClose();
      }
    };

    inputRef.addEventListener('keydown', handleKeyDown);

    return () => {
      inputRef.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputRef, localLabel, onSave]);

  return (
    <AlignmentWrapper>
      <StyledToolbar direction="horizontal" style={{ padding: 4 }}>
        <InputExp
          value={localLabel}
          type="text"
          onChange={(e) => setLocalLabel(e.target.value)}
          buttonProps={{
            icon: 'Checkmark',
            onClick: () => onSave(localLabel),
          }}
          width={200}
          ref={(ref) => setInputRef(ref)}
        />
      </StyledToolbar>
    </AlignmentWrapper>
  );
};

const StyledToolbar = styled(ToolBar)`
  padding: 4px;
`;

const AlignmentWrapper = styled.div`
  position: absolute;
  bottom: 22px;
  transform: translate(0, -100%);
`;

export default LabelToolbar;
