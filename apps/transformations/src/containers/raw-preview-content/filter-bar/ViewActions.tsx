import { Dispatch, SetStateAction } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common/i18n';

import { Button, Flex, SegmentedControl } from '@cognite/cogs.js';

import { RawTabView } from '../RawPreviewContent';

type ViewActionsProps = {
  selectedView: RawTabView;
  onToggleRawTableView: (view: RawTabView) => void;
  isTableDataLoading?: boolean;
  onClose?: () => void;
  isExpanded: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
};
export const ViewActions = ({
  selectedView,
  onToggleRawTableView,
  isTableDataLoading,
  onClose,
  isExpanded,
  setIsExpanded,
}: ViewActionsProps): JSX.Element => {
  const { t } = useTranslation();

  const handleSelectedSegmentChange = (key: string) => {
    if (key === RawTabView.Raw || key === RawTabView.Profiling) {
      onToggleRawTableView(key);
    }
  };

  return (
    <Flex>
      <SegmentedControl
        size="small"
        onButtonClicked={handleSelectedSegmentChange}
        currentKey={selectedView}
      >
        <SegmentedControl.Button
          key={RawTabView.Raw}
          icon="DataTable"
          disabled={isTableDataLoading}
        >
          {t('table-view')}
        </SegmentedControl.Button>
        <SegmentedControl.Button
          key={RawTabView.Profiling}
          icon="Profiling"
          disabled={isTableDataLoading}
        >
          {t('profile-view')}
        </SegmentedControl.Button>
      </SegmentedControl>
      <MoreAction>
        <Button
          icon={isExpanded ? 'Collapse' : 'Expand'}
          onClick={() => setIsExpanded((prevState) => !prevState)}
          size="small"
          type="ghost"
        />
        <Button icon="Close" onClick={onClose} size="small" type="ghost" />
      </MoreAction>
    </Flex>
  );
};

const MoreAction = styled(Flex).attrs({ gap: 4 })`
  padding-left: 8px;
`;
