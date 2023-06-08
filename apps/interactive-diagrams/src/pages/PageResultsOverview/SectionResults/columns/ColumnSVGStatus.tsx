import React from 'react';
import { useSelector } from 'react-redux';

import { Flex } from '@interactive-diagrams-app/components/Common';
import { RootState } from '@interactive-diagrams-app/store';
import { translateError } from '@interactive-diagrams-app/utils/handleError';
import { Tooltip } from 'antd';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Icon, Chip } from '@cognite/cogs.js';

type Props = { fileId: number };

export default function ColumnSVGStatus({ fileId }: Props) {
  const {
    errorMessage,
    status = 'N/A',
    svgId,
  } = useSelector((state: RootState) => state.svgConvert[fileId] ?? {});

  const onSVGViewClick = () => {
    const url = createLink(`/explore/file/${svgId}`);
    window.open(url, '_blank');
  };

  const error = translateError(errorMessage);
  const statusMap = convertStatusMap(onSVGViewClick, error);
  const fixedStatus = statusMap[status] ?? 'N/A';

  return <Flex align>{fixedStatus}</Flex>;
}

const convertStatusMap = (
  onSVGViewClick: () => void,
  error?: string
): { [key: string]: JSX.Element } => ({
  Queued: <Icon type="Loader" />,
  Distributing: <Icon type="Loader" />,
  Distributed: <Icon type="Loader" />,
  Running: <Icon type="Loader" />,
  Collecting: <Icon type="Loader" />,
  Completed: (
    <Button size="small" type="tertiary" onClick={onSVGViewClick}>
      View SVG
    </Button>
  ),
  Failed: (
    <Tooltip title={error}>
      <Chip
        label="Failed"
        icon="Info"
        iconPlacement="right"
        size="medium"
        type="danger"
        hideTooltip
      />
    </Tooltip>
  ),
});
