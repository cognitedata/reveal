import { Section, AppItem } from '../types';
export interface RawSection extends Omit<Section, 'items'> {
  items: AppItem[];
}
