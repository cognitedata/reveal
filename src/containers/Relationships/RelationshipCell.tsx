import React from 'react';
import { useRelationships } from 'hooks/RelationshipHooks';
import { Loader } from 'components';
import { ResourceType } from 'types';
import { RelationshipCount } from 'containers/Relationships/RelationshipCount';

export type RelatedResourceTypes = {
  [key in ResourceType]: number;
};

export const RelationshipCell = ({
  resourceExternalId,
}: {
  resourceExternalId?: string;
}) => {
  const { data: relationships, isFetching, isFetched } = useRelationships(
    resourceExternalId
  );

  const counts = relationships.reduce(
    (types, item) => ({
      ...types,
      [item.type]: types[item.type] ? types[item.type] + 1 : 1,
    }),
    {} as RelatedResourceTypes
  );

  if (isFetching && !isFetched) {
    return <Loader />;
  }

  return (
    <>
      <RelationshipCount
        type="asset"
        count={counts.asset}
        key={`${resourceExternalId}_asset`}
      />
      <RelationshipCount
        type="file"
        count={counts.file}
        key={`${resourceExternalId}_file`}
      />
      <RelationshipCount
        type="timeSeries"
        count={counts.timeSeries}
        key={`${resourceExternalId}_timeSeries`}
      />
      <RelationshipCount
        type="event"
        count={counts.event}
        key={`${resourceExternalId}_event`}
      />
      <RelationshipCount
        type="sequence"
        count={counts.sequence}
        key={`${resourceExternalId}_sequence`}
      />
    </>
  );
};
