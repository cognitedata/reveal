import React from 'react';

import { BreakJourneyModal } from '@data-exploration/components';

import { Button } from '@cognite/cogs.js';

import {
  useBreakJourneyPromptToggle,
  usePushJourney,
} from '@data-exploration-app/hooks';
import { getSearchParamsWithJourney } from '@data-exploration-lib/core';

export const BreakJourneyPrompt: React.FC<unknown> = () => {
  const [pushJourney] = usePushJourney();
  const [promptItem, setPromptOpen] = useBreakJourneyPromptToggle();

  const handlePromptToggle = (isPromptOpen: boolean) => {
    setPromptOpen(isPromptOpen);
  };

  return (
    <BreakJourneyModal
      visible={Boolean(promptItem)}
      hideFooter
      onCancel={() => {
        handlePromptToggle(false);
      }}
    >
      <div>You are about to end your current journey</div>
      <div style={{ display: 'flex', marginTop: '30px' }}>
        <Button
          type="ghost"
          alignVertically="left"
          onClick={() => handlePromptToggle(false)}
        >
          Cancel
        </Button>
        <div
          style={{
            marginLeft: 'auto',
            display: 'grid',
            gap: '8px',
            gridTemplateColumns: '1fr 1fr',
          }}
        >
          <Button
            type="secondary"
            onClick={() => {
              if (promptItem) {
                pushJourney(promptItem, true);
              }
              handlePromptToggle(false);
            }}
          >
            Overwrite current flow
          </Button>
          <Button
            icon="ArrowUpRight"
            type="primary"
            onClick={() => {
              if (promptItem) {
                const origin = window.location.origin;
                const pathname = window.location.pathname;
                const searchParams = getSearchParamsWithJourney(promptItem);
                const url = `${origin}${pathname}${searchParams}`;
                window.open(url, '_blank');
              }
              handlePromptToggle(false);
            }}
          >
            Open in new browser tab
          </Button>
        </div>
      </div>
    </BreakJourneyModal>
  );
};
