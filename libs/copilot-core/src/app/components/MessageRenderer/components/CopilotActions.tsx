import { useState } from 'react';

import { Button, Flex, toast } from '@cognite/cogs.js';

import { CopilotBotMessage } from '../../../../lib/types';
import { useMetrics } from '../../../hooks/useMetrics';

import { ResponsiveActions } from './ResponsiveActions';

export const CopilotActions = ({
  message: { content, actions = [], chain },
}: {
  message: CopilotBotMessage;
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState('');

  const { track } = useMetrics();
  return (
    <Flex gap={4} className="actions">
      <div style={{ flex: 1 }}>
        <ResponsiveActions
          actions={[
            ...actions,
            {
              content: 'Copy',
              icon: 'ReportCopy',
              onClick: () => {
                navigator.clipboard.writeText(content);
                toast.success('Copied to clipboard');
              },
            },
          ]}
        />
      </div>
      <Button
        icon="ThumbUp"
        aria-label="Give positive feedback"
        type="ghost"
        disabled={!!selectedFeedback}
        size="small"
        className={`ai ${selectedFeedback === 'positive' ? 'selected' : ''}`}
        onClick={() => {
          setSelectedFeedback('positive');
          track('FEEDBACK_POSITIVE', {
            content: content,
            chain: chain,
          });
        }}
      />
      <Button
        icon="ThumbDown"
        aria-label="Give negative feedback"
        type="ghost"
        disabled={!!selectedFeedback}
        size="small"
        className={`ai thumbsdown ${
          selectedFeedback === 'negative' ? 'selected' : ''
        }`}
        onClick={() => {
          setSelectedFeedback('negative');
          track('FEEDBACK_NEGATIVE', {
            content: content,
            chain: chain,
          });
        }}
      />
    </Flex>
  );
};
