import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { Link } from 'react-router-dom';

import { createLink } from '@cognite/cdf-utilities';
import { Colors, Icon } from '@cognite/cogs.js';

import { useExtpipeConfig } from '../../hooks/config';
import { useSelectedExtpipe } from '../../hooks/useExtpipe';
import { EXT_PIPE_PATH } from '../../routing/RoutingConfig';
import { EXTRACTION_PIPELINES_PATH } from '../../utils/baseURL';

type Props = {
  createdTime: number;
};

export const ConfigurationLink: FunctionComponent<Props> = ({
  createdTime,
}: PropsWithoutRef<Props>) => {
  const { data: extpipe } = useSelectedExtpipe();

  const { data, isInitialLoading } = useExtpipeConfig(
    { externalId: extpipe!.externalId, activeAtTime: createdTime },
    { enabled: !!extpipe!.externalId }
  );
  if (isInitialLoading) {
    return (
      <Icon
        type="Loader"
        css={{ color: Colors['decorative--grayscale--600'] }}
      />
    );
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
