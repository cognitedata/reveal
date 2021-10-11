import React from 'react';

import { useTheme } from 'styles/useTheme';

import { HeaderContainer } from '../../elements';

interface Props {
  SearchInput: React.ReactNode | React.ReactElement[];
}
export const SearchHeader: React.FC<Props> = ({ SearchInput }) => {
  const theme = useTheme();

  return <HeaderContainer theme={theme}>{SearchInput}</HeaderContainer>;
};
