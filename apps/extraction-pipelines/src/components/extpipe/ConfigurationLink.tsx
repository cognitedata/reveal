import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { useExtpipeConfig } from 'hooks/config';
import { createLink } from '@cognite/cdf-utilities';
import { Link } from 'react-router-dom';
import { EXTRACTION_PIPELINES_PATH } from 'utils/baseURL';
import { useSelectedExtpipe } from 'hooks/useExtpipe';
import { EXT_PIPE_PATH } from 'routing/RoutingConfig';
import { Colors, Icon } from '@cognite/cogs.js';

type Props = {
  createdTime: number;
};

export const ConfigurationLink: FunctionComponent<Props> = ({
  createdTime,
}: PropsWithoutRef<Props>) => {
  const { data: extpipe } = useSelectedExtpipe();

  const { data, isLoading } = useExtpipeConfig(
    { externalId: extpipe?.externalId!, activeAtTime: createdTime },
    { enabled: !!extpipe?.externalId }
  );
  if (isLoading) {
    return <Icon type="Loader" style={{ color: Colors['greyscale-grey6'] }} />;
  }

  if (data) {
    return (
      <Link
        to={createLink(
          `/${EXTRACTION_PIPELINES_PATH}/${EXT_PIPE_PATH}/${extpipe?.id}/config/${data.revision}`
        )}
      >
        {data.revision}
      </Link>
    );
  }

  return null;
};
