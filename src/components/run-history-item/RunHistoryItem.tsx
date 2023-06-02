import { SegmentedControl } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common';
import TabHeader from 'components/tab-header/TabHeader';

interface RunHistoryItemProps {
  isExpanded?: boolean;
  tabView?: string;
  updateTabView: (view: string) => void;
}

const RunHistoryItem = ({
  isExpanded,
  updateTabView,
  tabView,
}: RunHistoryItemProps) => {
  const { t } = useTranslation();

  return (
    <TabHeader
      description="description" // TODO
      extra={
        isExpanded ? (
          <StyledSegmentedControlContainer onClick={(e) => e.stopPropagation()}>
            <StyledSegmentedControl
              currentKey={tabView}
              size="small"
              onButtonClicked={updateTabView}
            >
              <SegmentedControl.Button key="results">
                {t('results')}
              </SegmentedControl.Button>
              <SegmentedControl.Button key="sql">
                {t('definition')}
              </SegmentedControl.Button>
            </StyledSegmentedControl>
          </StyledSegmentedControlContainer>
        ) : undefined
      }
      icon="InfoFilled" // TODO
      status="neutral"
      title="title" // TODO
    />
  );
};

const StyledSegmentedControl = styled(SegmentedControl)`
  margin-top: -3px;
  margin-right: 32px;
`;

const StyledSegmentedControlContainer = styled.div`
  height: 18px;
`;

export default RunHistoryItem;
