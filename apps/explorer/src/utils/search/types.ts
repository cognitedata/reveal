import { ListDataPerson, ListDataRoom } from 'components/List';

export type SearchDataFormatRoom = ListDataRoom & { section: string };

export type SearchDataFormatPerson = ListDataPerson & { section: string };

export type SearchDataFormat = SearchDataFormatRoom | SearchDataFormatPerson;
