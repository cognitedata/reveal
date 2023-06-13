import React from 'react';

import styled from 'styled-components';

import { Body, Flex, Button, Link, Tooltip } from '@cognite/cogs.js';

import { useClipboard } from '../../hooks/useClipboard';
// import { useClipboard } from '@data-exploration-components/hooks';

type DetailsItemProps = {
  name: string;
  value?: React.ReactNode;
  copyable?: boolean;
  link?: string;
};
// If you enable the copyable props, Make sure to add the Unique key props  to the component wherever it is being used
export const DetailsItem = ({
  name,
  value,
  copyable = true,
  link,
}: DetailsItemProps) => {
  const clipboardValue =
    copyable && (typeof value === 'string' || typeof value === 'number')
      ? value
      : '';

  const { hasCopied, onCopy } = useClipboard();

  const handleOnClickCopy = () => {
    onCopy(clipboardValue.toString());
  };

  return (
    <Flex>
      <DetailsItemContainer>
        <Body level={2} strong>
          {name}
        </Body>

        <Spacer />

        {Boolean(value) &&
          (link ? (
            <Link
              href={link}
              size="small"
              target="_blank"
              className="details-item-value"
            >
              {value}
            </Link>
          ) : (
            <Body level={2} className="details-item-value">
              {value}
            </Body>
          ))}
        {!value && <MutedBody level={2}>-</MutedBody>}
      </DetailsItemContainer>

      <ButtonWrapper visible={copyable && Boolean(value)}>
        <Tooltip content={hasCopied ? 'Copied' : 'Copy'}>
          <Button
            type="ghost"
            size="small"
            icon={hasCopied ? 'Checkmark' : 'Copy'}
            disabled={hasCopied}
            onClick={handleOnClickCopy}
            aria-label="Copy"
          />
        </Tooltip>
      </ButtonWrapper>
    </Flex>
  );
};

const DetailsItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  margin-bottom: 8px;
  padding-top: 5px;
  align-items: flex-start;

  .details-item-value {
    word-break: break-word;
  }
`;

const Spacer = styled.div`
  flex: 1;
  border-bottom: var(--cogs-border--muted) 1px dashed;
  margin: 4px 8px;
  min-width: 60px;
  height: 14px;
`;

const MutedBody = styled(Body)`
  color: var(--cogs-text-icon--muted);
`;

const ButtonWrapper = styled.div<{ visible?: boolean }>`
  margin-left: 8px;
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  visibility: ${({ visible }) => (visible ? 'unset' : 'hidden')};
`;
