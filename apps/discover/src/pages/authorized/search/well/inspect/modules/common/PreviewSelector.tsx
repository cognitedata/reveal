import { useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { PreviewButton } from 'components/buttons';
import { Dropdown } from 'components/dropdown';

import {
  PreviewSelectorWrapper,
  PreviewModeWrapper,
  PreviewButtonWrapper,
} from './elements';

export type PreviewMode = {
  id: number;
  title: string;
};

const previewModes: PreviewMode[] = [
  { id: 1, title: '2D' },
  // { id: 2, title: '3D' },
];

interface CallBackProps {
  previewMode: PreviewMode;
  selected: any;
}
interface OuterProps {
  onApplyChanges?: ({ previewMode, selected }: CallBackProps) => void;
  enableModeSelector?: boolean;
}
interface Props {
  selected: any;
}

const PreviewSelector: (outerProps: OuterProps) => React.FC<Props> =
  (outerProps): React.FC<Props> =>
  ({ selected }) => {
    const [previewMode, setPreviewMode] = useState({ ...previewModes[0] });
    const { onApplyChanges, enableModeSelector = false } = outerProps;

    const handlePreviewClick = () => {
      if (onApplyChanges) {
        onApplyChanges({ previewMode, selected });
      }
    };

    return (
      <PreviewSelectorWrapper>
        <PreviewButtonWrapper>
          <PreviewButton
            type="primary"
            onClick={handlePreviewClick}
            id="preview-button"
            data-testid="preview-button"
          />
        </PreviewButtonWrapper>

        {enableModeSelector && (
          <PreviewModeWrapper>
            <Dropdown
              handleChange={(_event: any, item: PreviewMode) => {
                setPreviewMode({ ...item });
              }}
              selected={{ ...previewMode }}
              items={previewModes}
              displayField="title"
              valueField="id"
            >
              <Button
                data-testid="preview-mode-button"
                variant="default"
                type="secondary"
              >
                {previewMode.title}
              </Button>
            </Dropdown>
          </PreviewModeWrapper>
        )}
      </PreviewSelectorWrapper>
    );
  };

export default PreviewSelector;
