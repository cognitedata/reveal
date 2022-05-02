import React, { useState } from 'react';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';

import { PreviewButton } from 'components/Buttons';

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

const Preview: React.FC<Props & { outerProps: OuterProps }> = React.memo(
  ({ outerProps, selected }) => {
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
              content={
                <Menu>
                  {previewModes.map((item) => (
                    <Menu.Item
                      key={item.id}
                      onClick={() => setPreviewMode(item)}
                    >
                      {item.title}
                    </Menu.Item>
                  ))}
                </Menu>
              }
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
  }
);

const PreviewSelector: (outerProps: OuterProps) => React.FC<Props> =
  (outerProps) =>
  ({ selected }) =>
    <Preview selected={selected} outerProps={outerProps} />;

export default PreviewSelector;
