import styled from 'styled-components';

import { useAISearchParams } from '@fdx/shared/hooks/useParams';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';

import { SegmentedControl } from '@cognite/cogs.js';

import { AiSearchIcon } from './AiSearchIcon';
export const AISwitch = () => {
  const { t } = useTranslation();
  const [isAIEnabled, setIsAIEnabled] = useAISearchParams();
  return (
    <AISegmentedControl
      className="cogs-segmented-control--ai-switch"
      currentKey={isAIEnabled ? 'AI' : 'Search'}
      onButtonClicked={() => {
        setIsAIEnabled(!isAIEnabled);
      }}
    >
      <SegmentedControl.Button key="Search">
        {t('AI_NORMAL_SEARCH_SWITCH')}
      </SegmentedControl.Button>
      <SegmentedControl.Button key="AI">
        <AiSearchIcon />
        {t('AI_AI_SEARCH_SWITCH')}
      </SegmentedControl.Button>
    </AISegmentedControl>
  );
};

const AISegmentedControl = styled(SegmentedControl)`
  --cogs-border-radius--default: 24px;

  .cogs-segmented-control__list__button__text {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;
