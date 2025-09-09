import { type DataSourceType, type Cognite3DViewer, type Image360 } from '@cognite/reveal';
import { type MutableRefObject } from 'react';
import { type Image360RevisionDetails } from './Toolbar/Image360HistoricalSummary';

export type Image360HistoricalDetailsProps = {
  viewer: Cognite3DViewer<DataSourceType>;
  image360Entity?: Image360<DataSourceType>;
  onExpand?: (isExpanded: boolean) => void;
  fallbackLanguage?: string;
};

export type UseImage360HistoricalDetailsViewModelResult = {
  revisionDetailsExpanded: boolean;
  setRevisionDetailsExpanded: (expanded: boolean) => void;
  activeRevision: number;
  setActiveRevision: (revision: number) => void;
  revisionCollection: Image360RevisionDetails[];
  imageUrls: Array<string | undefined>;
  minWidth: string;
  newScrollPosition: MutableRefObject<number>;
  stationId: string | undefined;
  stationName: string | undefined;
};
