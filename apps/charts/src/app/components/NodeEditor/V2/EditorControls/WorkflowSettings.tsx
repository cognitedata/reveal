import { ComponentProps } from 'react';

import styled from 'styled-components/macro';

import { Menu, SegmentedControl, Title } from '@cognite/cogs.js';

import { defaultTranslations } from '../../translations';
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
        </ATitleWrapper>
        <ATextWrapper>
          {t['Automatically align time stamp of input time series']}
        </ATextWrapper>
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
  width: 270px;
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
  margin-bottom: 4px;

  h6 {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }
`;

const ATextWrapper = styled.p`
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
`;

const FormWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

WorkflowSettings.translationKeys = Object.keys(defaultTranslations);
export default WorkflowSettings;
