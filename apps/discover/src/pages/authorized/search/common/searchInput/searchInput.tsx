import * as React from 'react';

import { HeaderContainer } from '../../elements';

interface Props {
  SearchInput: React.ReactNode | React.ReactElement[];
}
export const SearchHeader: React.FC<Props> = ({ SearchInput }) => (
  <HeaderContainer>{SearchInput}</HeaderContainer>
);
