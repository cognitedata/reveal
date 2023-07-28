import { AppItem, Section } from '../../types';

export type ItemWithSection = AppItem & {
  section: Section['internalId'];
  colors: Section['colors'];
};

export type CategoryId = Section['internalId'] | 'All';
