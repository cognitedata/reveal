import React from 'react';
import { useRelationships } from 'lib/hooks/RelationshipHooks';
import { Loader } from 'lib/components';
import { ResourceType } from 'lib/types';
import { RelationshipCount } from 'lib/containers/Relationships/RelationshipCount';

export type RelatedResourceTypes = {
  [key in ResourceType]: number;
};

export const RelationshipCell = ({
  resourceExternalId,
}: {
  resourceExternalId?: string;
}) => {
  const { data: relationships, isFetching } = useRelationships(
    resourceExternalId
  );

  const counts = relationships.reduce(
    (types, item) => ({
      ...types,
      [item.type]: types[item.type] ? types[item.type] + 1 : 1,
    }),
    {} as RelatedResourceTypes
  );

  if (isFetching) {
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
