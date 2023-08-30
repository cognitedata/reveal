import React from 'react';

import styled from 'styled-components';

import { Colors } from '../Components/Colors';

type Props = { text: React.ReactNode };

export const ErrorNotification = (props: Props): JSX.Element => {
  const { text } = props;

  return <ErrorWrapper>{text}</ErrorWrapper>;
};

const ErrorWrapper = styled.div`
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  margin: 6px 0;
  color: ${Colors['danger-text']};
`;
