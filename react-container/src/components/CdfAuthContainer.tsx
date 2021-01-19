import React from 'react';
import { Loader } from '@cognite/cogs.js';

import { useLoginToCdf } from 'hooks/useLoginToCdf';

import { AuthResult } from '../auth/types';

const { REACT_APP_API_KEY: apiKey = '' } = process.env;

interface Props {
  project: string;
  children: React.FC<{ authResult: AuthResult }>;
}
export const CdfAuthContainer: React.FC<Props> = ({
  children,
  project,
}: Props) => {
  const { authResult } = useLoginToCdf({
    apiKey,
    project,
  });

  if (authResult) {
    return children({ authResult });
  }

  return <Loader darkMode={false} />;
};
