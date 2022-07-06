import { Domain } from '../Log/types';

export type DomainListItem = {
  columnExternalId: string;
  min: number;
  max: number;
};

export type DomainMap = Record<string, Domain>;
export type DomainChangeCallback = (
  columnExternalId: string,
  domainType: 'min' | 'max',
  value: number
) => void;

export interface DomainFilterProps {
  domainList: DomainListItem[];
  onChangeDomain: DomainChangeCallback;
}

export interface DomainFilterRowProps {
  domainListItem: DomainListItem;
  onChangeDomain: DomainChangeCallback;
}
