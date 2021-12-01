import { DocumentSearchQuery } from 'services/types';

export interface FilterProps {
  onChange: (state: DocumentSearchQuery) => void;
}
