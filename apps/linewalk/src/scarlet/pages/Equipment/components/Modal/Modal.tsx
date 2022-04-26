import { ReactNode } from 'react';
import {
  Button,
  ButtonType,
  ModalProps as CogsModalProps,
} from '@cognite/cogs.js';

import * as Styled from './style';

export type ModalProps = Omit<CogsModalProps, 'children'> & {
  children?: ReactNode;
  skipCancelButton?: boolean;
  okButtonType?: ButtonType;
  description?: string;
  loading?: boolean;
  isPrompt?: boolean;
  secondaryButton?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
};

export const Modal = ({
  cancelText = 'Cancel',
  skipCancelButton,
  secondaryButton,
  okText,
  onOk,
  okButtonType = 'primary',
  title,
  description,
  children,
  loading,
  closable = true,
  isPrompt = false,
  ...props
}: ModalProps) => (
  <Styled.Modal
    appElement={document.getElementById('root') || undefined}
    footer={null}
    closable={closable && !loading}
    width={isPrompt ? 330 : 980}
    isPrompt={isPrompt}
    {...props}
  >
    {title && (
      <Styled.Title>
        <span className={isPrompt ? 'cogs-body-1 strong' : 'cogs-title-4'}>
          {title}
        </span>
      </Styled.Title>
    )}
    {description && (
      <Styled.Description className="cogs-body-2">
        {description}
      </Styled.Description>
    )}
    {children}
    <Styled.Footer>
      {!skipCancelButton && (
        <Button type={isPrompt ? 'ghost' : 'tertiary'} onClick={props.onCancel}>
          {cancelText}
        </Button>
      )}
      {secondaryButton && (
        <Styled.SecondaryButtonContainer>
          <Button
            disabled={secondaryButton.disabled}
            loading={secondaryButton.loading}
            type="tertiary"
            onClick={secondaryButton.onClick}
          >
            {secondaryButton.label}
          </Button>
        </Styled.SecondaryButtonContainer>
      )}

      <Button
        disabled={props.okDisabled}
        loading={loading}
        type={okButtonType}
        onClick={onOk}
      >
        {okText}
      </Button>
    </Styled.Footer>
  </Styled.Modal>
);
