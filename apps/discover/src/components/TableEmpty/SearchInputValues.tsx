import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  RemoveValue,
  SearchInputContainer,
  Title,
  ValueContainer,
  ValueSpan,
} from './elements';

export interface Props {
  caption: string;
  value?: string | null;
  onClick?: () => void;
}
export const SearchInputValues: React.FC<Props> = ({
  caption,
  value,
  onClick,
}) => {
  const { t } = useTranslation();

  if (!value) return null;

  return (
    <SearchInputContainer>
      <Title>{t(caption)}: </Title>
      <ValueContainer data-testid="filter-tag">
        <ValueSpan>{value} </ValueSpan>
        <RemoveValue data-testid="remove-btn" onClick={onClick} />
      </ValueContainer>
    </SearchInputContainer>
  );
};
