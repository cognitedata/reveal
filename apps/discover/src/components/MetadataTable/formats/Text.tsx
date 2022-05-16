import React from 'react';

import { TextContainer } from '../elements';

export const Text: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  return <TextContainer>{children}</TextContainer>;
};
