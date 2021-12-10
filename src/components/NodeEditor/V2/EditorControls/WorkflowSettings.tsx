import styled from 'styled-components/macro';
import { Icon, Menu, SegmentedControl, Title, Tooltip } from '@cognite/cogs.js';
import { ComponentProps } from 'react';
import ReactFlowNodeEditor from '../ReactFlowNodeEditor';

type Props = {
  settings: ComponentProps<typeof ReactFlowNodeEditor>['settings'];
  onSaveSettings: (settings: Props['settings']) => void;
  readOnly?: boolean;
};

const WorkflowSettings = ({
  settings,
  readOnly = false,
  onSaveSettings,
}: Props) => {
  return (
    <Menu style={{ marginBottom: 10 }}>
      <DropdownContainer>
        <ATitleWrapper>
          <Title level={6}>Automatic data alignment</Title>
          <Tooltip content="Automatically align time stamp of input time series">
            <Icon type="Info" />
          </Tooltip>
        </ATitleWrapper>
        {readOnly && (settings.autoAlign ? 'On' : 'Off')}
        {!readOnly && (
          <FormWrapper>
            <SegmentedControl
              currentKey={settings.autoAlign ? 'on' : 'off'}
              onButtonClicked={(key: string) =>
                onSaveSettings({ ...settings, autoAlign: key === 'on' })
              }
            >
              <SegmentedControl.Button key="on">On</SegmentedControl.Button>
              <SegmentedControl.Button key="off">Off</SegmentedControl.Button>
            </SegmentedControl>
          </FormWrapper>
        )}
      </DropdownContainer>
    </Menu>
  );
};

const DropdownContainer = styled.div`
  width: 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px;
`;

const ATitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FormWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export default WorkflowSettings;
