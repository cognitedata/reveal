import styled from 'styled-components/macro';
import { Icon, Menu, SegmentedControl, Title, Tooltip } from '@cognite/cogs.js';
import { ComponentProps } from 'react';
import { defaultTranslations } from 'components/NodeEditor/translations';
import ReactFlowNodeEditor from '../ReactFlowNodeEditor';

type Props = {
  settings: ComponentProps<typeof ReactFlowNodeEditor>['settings'];
  onSaveSettings: (settings: Props['settings']) => void;
  readOnly?: boolean;
  translations: typeof defaultTranslations;
};

const WorkflowSettings = ({
  settings,
  readOnly = false,
  onSaveSettings,
  translations: t,
}: Props) => {
  return (
    <Menu style={{ marginBottom: 10 }}>
      <DropdownContainer>
        <ATitleWrapper>
          <Title level={6}>{t['Automatic data alignment']}</Title>
          <Tooltip
            content={t['Automatically align time stamp of input time series']}
          >
            <Icon type="Info" />
          </Tooltip>
        </ATitleWrapper>
        {readOnly && (settings.autoAlign ? t.On : t.Off)}
        {!readOnly && (
          <FormWrapper>
            <SegmentedControl
              currentKey={settings.autoAlign ? 'on' : 'off'}
              onButtonClicked={(key: string) =>
                onSaveSettings({ ...settings, autoAlign: key === 'on' })
              }
            >
              <SegmentedControl.Button key="on">{t.On}</SegmentedControl.Button>
              <SegmentedControl.Button key="off">
                {t.Off}
              </SegmentedControl.Button>
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

WorkflowSettings.translationKeys = Object.keys(defaultTranslations);
export default WorkflowSettings;
