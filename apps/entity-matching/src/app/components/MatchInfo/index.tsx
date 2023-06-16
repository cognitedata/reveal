import _ from 'lodash-es';

import { Icon } from '@cognite/cogs.js';

import ResourceCell from '@entity-matching-app/components/pipeline-run-results-table/ResourceCell';
import { useRetrieve } from '@entity-matching-app/hooks/retrieve';
import { API } from '@entity-matching-app/types/api';

type Props = {
  api: API;
  id: number;
};
export default function MatchInfo({ api, id }: Props) {
  switch (api) {
    case 'timeseries': {
      return <TSInfo id={id} />;
    }
    case 'events': {
      return <EventInfo id={id} />;
    }
    case 'files': {
      return <FileInfo id={id} />;
    }
    case 'sequences': {
      return <SequenceInfo id={id} />;
    }
    case 'threeD': {
      return null;
    }
    default: {
      return null;
    }
  }
}

function TSInfo({ id }: { id: number }) {
  const { data, isInitialLoading } = useRetrieve('timeseries', [{ id }]);
  if (isInitialLoading) {
    return <Icon type="Loader" />;
  }
  if (data && !!data[0]?.assetId) {
    return <AssetCell id={data[0].assetId} />;
  }
  return null;
}

function FileInfo({ id }: { id: number }) {
  const { data, isInitialLoading } = useRetrieve('files', [{ id }]);
  if (isInitialLoading) {
    return <Icon type="Loader" />;
  }
  if (data && (data[0]?.assetIds?.length || 0) > 0) {
    return (
      <>
        {data[0].assetIds?.map((id) => (
          <AssetCell key={id} id={id} />
        ))}
      </>
    );
  }
  return null;
}

function SequenceInfo({ id }: { id: number }) {
  const { data, isInitialLoading } = useRetrieve('sequences', [{ id }]);
  if (isInitialLoading) {
    return <Icon type="Loader" />;
  }
  if (data && !!data[0]?.assetId) {
    return <AssetCell id={data[0].assetId} />;
  }
  return null;
}

function EventInfo({ id }: { id: number }) {
  const { data, isInitialLoading } = useRetrieve('events', [{ id }]);
  if (isInitialLoading) {
    return <Icon type="Loader" />;
  }
  if (data) {
    return (
      <>
        {data[0].assetIds?.map((id) => (
          <AssetCell key={id} id={id} />
        ))}
      </>
    );
  }
  return null;
}

function AssetCell({ id }: { id: number }) {
  const { data = [], isInitialLoading } = useRetrieve('assets', [{ id: id! }]);
  if (isInitialLoading) {
    return <Icon type="Loader" />;
  }
  if (data.length === 1) {
    const resource = _.pick(data[0], [
      'id',
      'name',
      'description',
      'source',
      'externalId',
    ]);
    return <ResourceCell resource={resource} showId />;
  }
  return null;
}
