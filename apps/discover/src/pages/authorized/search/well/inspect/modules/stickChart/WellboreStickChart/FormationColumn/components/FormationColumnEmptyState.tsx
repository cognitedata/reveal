import * as React from 'react';

import { LOADING_TEXT } from '../../constants';
import { EMPTY_FORMATION_TEXT } from '../constants';
import {
  FormationColumnBlockText,
  FormationColumnEmptyStateWrapper,
} from '../elements';

export interface FormationColumnEmptyStateProps {
  isLoading?: boolean;
}

export const FormationColumnEmptyState: React.FC<
  FormationColumnEmptyStateProps
> = ({ isLoading = false }) => {
  return (
    <FormationColumnEmptyStateWrapper>
      <FormationColumnBlockText>
        {isLoading ? LOADING_TEXT : EMPTY_FORMATION_TEXT}
      </FormationColumnBlockText>
    </FormationColumnEmptyStateWrapper>
  );
};
