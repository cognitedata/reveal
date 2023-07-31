import * as React from 'react';

import { LOADING_TEXT, NO_DATA_TEXT } from '../../constants';
import {
  FormationColumnBlockText,
  FormationColumnEmptyStateWrapper,
} from '../elements';

export interface FormationColumnEmptyStateProps {
  isLoading?: boolean;
  emptyText?: string;
}

export const FormationColumnEmptyState: React.FC<
  FormationColumnEmptyStateProps
> = ({ isLoading = false, emptyText = NO_DATA_TEXT }) => {
  return (
    <FormationColumnEmptyStateWrapper>
      <FormationColumnBlockText>
        {isLoading ? LOADING_TEXT : emptyText}
      </FormationColumnBlockText>
    </FormationColumnEmptyStateWrapper>
  );
};
