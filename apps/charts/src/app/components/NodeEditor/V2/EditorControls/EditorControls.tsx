import { ComponentProps, useState } from 'react';
import { useZoomPanHelper } from 'react-flow-renderer';

import { Badge } from 'antd';

import { Dropdown, Icon } from '@cognite/cogs.js';

import { defaultTranslations } from '../../translations';
import ReactFlowNodeEditor from '../ReactFlowNodeEditor';

import { CustomControlButtonGroup, CustomControlButton } from './elements';
import WorkflowSettings from './WorkflowSettings';

type Props = {
  settings: ComponentProps<typeof ReactFlowNodeEditor>['settings'];
  readOnly: boolean;
  onSaveSettings: (settings: Props['settings']) => void;
  translations: typeof defaultTranslations;
  horizontal?: boolean;
};

const EditorControls = ({
  settings,
  readOnly,
  onSaveSettings = () => {},
  translations: t,
  horizontal,
}: Props) => {
  const { fitView, zoomIn, zoomOut } = useZoomPanHelper();
  const [isAutoAlignDropdownVisible, setIsAutoAlignDropdownVisible] =
    useState<boolean>(false);

  return (
    <CustomControlButtonGroup
      showZoom={false}
      showFitView={false}
      showInteractive={false}
      className={`${horizontal ? 'react-flow__controls--horizontal' : ''}`}
    >
      <CustomControlButton onClick={() => zoomIn()}>
        <Icon type="ZoomIn" />
      </CustomControlButton>
      <CustomControlButton onClick={() => zoomOut()}>
        <Icon type="ZoomOut" />
      </CustomControlButton>
      <CustomControlButton onClick={() => fitView({ padding: 0.2 })}>
        <Icon type="FullScreen" />
      </CustomControlButton>

      <Dropdown
        content={
          <WorkflowSettings
            settings={settings}
            onSaveSettings={onSaveSettings}
            readOnly={readOnly}
            translations={t}
          />
        }
        visible={isAutoAlignDropdownVisible}
        onClickOutside={() => setIsAutoAlignDropdownVisible(false)}
        placement={horizontal ? 'bottom' : 'right'}
        arrow
      >
        <CustomControlButton
          onClick={() => setIsAutoAlignDropdownVisible((visible) => !visible)}
        >
          <Badge
            dot={!settings.autoAlign}
            style={{ color: 'var(--cogs-danger)' }}
          >
            <Icon type="Configure" />
          </Badge>
        </CustomControlButton>
      </Dropdown>
    </CustomControlButtonGroup>
  );
};

export default EditorControls;
