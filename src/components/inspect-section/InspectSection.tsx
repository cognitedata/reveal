import { Button, Colors, Elevations } from '@cognite/cogs.js';
import { Tabs } from 'antd';
import { useTranslation } from 'common';
import { RunHistorySection } from 'components/run-history-section/RunHistorySection';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { WorkflowWithVersions } from 'hooks/workflows';
import styled from 'styled-components';
const INSPECT_PANELS: {
  key: InspectSectionKey;
}[] = [
  {
    key: 'run-history',
  },
];

export type InspectSectionKey = 'run-history';

type InspectSectionProps = {
  workflow: WorkflowWithVersions;
};

export const InspectSection = ({
  workflow,
}: InspectSectionProps): JSX.Element => {
  const { t } = useTranslation();

  const { activeInspectSectionKey, setActiveInspectSectionKey } =
    useWorkflowBuilderContext();

  const renderSection = (key: InspectSectionKey) => {
    switch (key) {
      case 'run-history':
        return <RunHistorySection workflow={workflow} />;
    }
  };

  return (
    <StyledContainer>
      <StyledSection>
        <StyledSectionHeader>
          {INSPECT_PANELS.map(({ key }) => (
            <Button
              key={key}
              onClick={() => setActiveInspectSectionKey(key)}
              size="small"
              toggled={activeInspectSectionKey === key}
              type="ghost-accent"
            >
              {t(`inspect-panel-title-${key}`)}
            </Button>
          ))}
        </StyledSectionHeader>
        <StyledContent>
          <StyledTabs activeKey={activeInspectSectionKey}>
            {INSPECT_PANELS.map(({ key }) => (
              <Tabs.TabPane key={key}>{renderSection(key)}</Tabs.TabPane>
            ))}
          </StyledTabs>
        </StyledContent>
      </StyledSection>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledSection = styled.div`
  background-color: ${Colors['surface--muted']};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

const StyledContent = styled.div`
  display: flex;
  padding: 12px;
  flex: 1;
  overflow: auto;
`;

const StyledTabs = styled(Tabs)`
  width: 100%;

  .ant-tabs-nav {
    display: none;
  }

  .ant-tabs-content,
  .ant-tabs-tabpane {
    height: 100%;
  }
`;

const StyledSectionHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${Colors['border--status-undefined--muted']};
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 8px 12px;
`;

export default InspectSection;
