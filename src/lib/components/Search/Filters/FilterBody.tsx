import React from 'react';
import { ResourceType } from 'lib/types';
import AssetFilters from './AssetFilters';
import EventFilters from './EventFilters';
import TimeseriesFilters from './TimeseriesFilter';
import FileFilters from './FileFilters';
import SequenceFilters from './SequenceFilters';

export default function FilterBody({
  resourceType,
}: {
  resourceType: ResourceType;
}) {
  switch (resourceType) {
    case 'asset': {
      return <AssetFilters />;
    }
    case 'event': {
      return <EventFilters />;
    }
    case 'timeSeries': {
      return <TimeseriesFilters />;
    }
    case 'file': {
      return <FileFilters />;
    }
    case 'sequence': {
      return <SequenceFilters />;
    }
    default: {
      return null;
    }
  }
}
