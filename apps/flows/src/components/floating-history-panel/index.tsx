import { useMemo } from 'react';

import styled from 'styled-components';

import * as Automerge from '@automerge/automerge';
import { useTranslation } from '@flows/common';
import { FloatingPanel } from '@flows/components/floating-components-panel/FloatingComponentsPanel';
import { useWorkflowBuilderContext } from '@flows/contexts/WorkflowContext';

import { Button, Colors, Flex, Title } from '@cognite/cogs.js';

type ChangeMessage = {
  hash: string;
  time: number;
  message: {
    message: string;
    user?: string;
  };
};

export const FloatingHistoryPanel = (): JSX.Element => {
  const { t } = useTranslation();

  const {
    setHistoryVisible,
    flow,
    previewHash,
    setPreviewHash,
    restoreWorkflow,
  } = useWorkflowBuilderContext();

  const history = useMemo(
    () =>
      (
        Automerge.getHistory(flow)
          .filter((h) => !!h.change.message)
          .map((h) => {
            try {
              return {
                hash: h.change.hash,
                message: JSON.parse(h.change.message!),
                time: h.change.time,
              };
            } catch {
              return;
            }
            {
              return false;
            }
          })

          .filter(Boolean) as ChangeMessage[]
      ).sort((a, b) => b.time - a.time),
    [flow]
  );

  return (
    <FloatingPanel right>
      <Flex alignItems="flex-start" justifyContent="space-between">
        <Flex direction="column">
          <Title level={6}>{t('history')}</Title>
        </Flex>
        <Button
          aria-label="Close panel"
          icon="CloseLarge"
          onClick={() => {
            setHistoryVisible(false);
          }}
          type="ghost"
        />
      </Flex>
      <History>
        {history.map((h) => (
          <HistoryItem
            key={h.hash}
            onClick={() => {
              h.hash === previewHash
                ? setPreviewHash(undefined)
                : setPreviewHash(h.hash);
            }}
            $active={h.hash === previewHash}
          >
            <div>{new Date(h.time).toLocaleString()}</div>
            <Flex alignItems="center" justifyContent="space-between">
              <Flex direction="column">
                {h.message.user && <div>{h.message.user}</div>}
                <div>{h.message.message}</div>
              </Flex>
              {h.hash === previewHash && (
                <Flex>
                  <Button
                    onClick={(e) => {
                      setPreviewHash(undefined);
                      restoreWorkflow([h.hash]);
                      // Stop event triggering click handler in <HistoryItem>
                      e.stopPropagation();
                    }}
                  >
                    {t('restore')}
                  </Button>
                </Flex>
              )}
            </Flex>
          </HistoryItem>
        ))}
      </History>
    </FloatingPanel>
  );
};

const History = styled(Flex).attrs({ direction: 'column', gap: 8 })`
  overflow: auto;
`;

const HistoryItem = styled(Flex).attrs({
  direction: 'column',
})<{ $active?: boolean }>`
  padding: 6px;
  border-radius: 6px;

  background-color: ${({ $active }) =>
    $active ? Colors['surface--interactive--toggled-default'] : 'initial'};
  &:hover {
    background-color: ${Colors['surface--interactive--hover']};
  }
`;
