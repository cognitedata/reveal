import React from 'react';
import { Body, Flex, Detail, Title, toast } from '@cognite/cogs.js';
import styled from 'styled-components';

interface Props {
  title: string;
  message?: string;
  status?: number;
}

const defaultConfig = {
  position: 'bottom-left',
  autoClose: 5000,
};

const Content = styled.div`
  margin-top: 0.5rem;
`;

const ToastWrapper = ({ title, message, status }: Props) => {
  return (
    <Flex direction="column">
      <Title level={4}>{title}</Title>
      {status && <Detail>Status code: {status}</Detail>}
      {message && (
        <Content>
          <Body>{message}</Body>
        </Content>
      )}
    </Flex>
  );
};

export const Toast = {
  error: (props: Props) => {
    toast.error(<ToastWrapper {...props} />, defaultConfig as any);
  },
  success: (props: Props) => {
    toast.success(<ToastWrapper {...props} />, defaultConfig as any);
  },
  warning: (props: Props) => {
    toast.warning(<ToastWrapper {...props} />, defaultConfig as any);
  },
  info: (props: Props) => {
    toast.info(<ToastWrapper {...props} />, defaultConfig as any);
  },
};
