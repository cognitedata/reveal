import { Button, Detail, Flex, Title, Tooltip } from '@cognite/cogs.js';
import React from 'react';
import ErrorIcon from './ErrorIcon';

type Props = {
  error: {
    errorMessage: string;
    status: number;
    requestId?: string;
  };
  onPreviewClose?: () => void;
};
export function ErrorFeedback({ error, onPreviewClose }: Props) {
  return (
    <Flex
      style={{ height: '100%', width: '320px', alignSelf: 'center' }}
      gap={16}
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      {Boolean(onPreviewClose) && (
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          <Tooltip content="Close error">
            <Button
              icon="Close"
              aria-label="Close"
              onClick={() => {
                onPreviewClose!();
              }}
            />
          </Tooltip>
        </div>
      )}
      <div style={{ width: '320px' }}>
        <div style={{ textAlign: 'center' }}>
          <ErrorIcon />
        </div>
        <Title style={{ textAlign: 'center' }} level={5}>
          {error.status ? `${error.status}: ` : null}
          {error.errorMessage}
        </Title>
        {error.requestId && (
          <Flex
            style={{ textAlign: 'center', paddingTop: '16px' }}
            gap={4}
            direction="column"
          >
            <Title level={8}>Request ID: </Title>
            <Detail>{error.requestId}</Detail>
          </Flex>
        )}
      </div>
    </Flex>
  );
}
