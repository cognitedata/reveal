import React, { ReactText, useState } from 'react';
import styled from 'styled-components';
import { Button, Icon } from '@cognite/cogs.js';

const copyIconColor = '#4a67fb';
const copiedIconColor = '#3ad27f';

const CopiedIconContainer = styled.div`
  color: ${copiedIconColor};
  margin-left: 9px;
  padding: 2px 0;
  height: 22px;
`;

const CopyButton = styled(Button)`
  color: ${copyIconColor};
  margin-left: 9px;
  height: 22px;
`;

const CopyableTextContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const CopyButtonContainer = (props: {
  copied: boolean;
  onClick: (...args: any) => void;
}) => {
  if (props.copied) {
    return (
      <CopiedIconContainer>
        <Icon type="Checkmark" />
      </CopiedIconContainer>
    );
  }

  return (
    <CopyButton
      onClick={props.onClick}
      size="default"
      variant="default"
      type="link"
      icon="Copy"
      iconPlacement="right"
    />
  );
};

export const CopyableText = (props: {
  children: any;
  copyable?: boolean;
  text?: ReactText;
}) => {
  const { copyable, text } = props;
  const [copied, setCopied] = useState(false);

  const onCopyClick = () => {
    const updateClipboard = (txt: string) => {
      navigator.clipboard.writeText(txt).then(
        () => {
          /* clipboard successfully set */
        },
        () => {
          /* clipboard write failed */
        }
      );
    };

    if (text) {
      navigator.permissions
        .query({ name: 'clipboard-write' } as any)
        .then((result) => {
          if (result.state === 'granted' || result.state === 'prompt') {
            updateClipboard(text.toString());
          }
        })
        .catch(() => {
          updateClipboard(text.toString());
        });

      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 4000);
    }
  };

  return (
    <CopyableTextContainer>
      {props.children}
      {copyable && text && (
        <CopyButtonContainer copied={copied} onClick={onCopyClick} />
      )}
    </CopyableTextContainer>
  );
};
