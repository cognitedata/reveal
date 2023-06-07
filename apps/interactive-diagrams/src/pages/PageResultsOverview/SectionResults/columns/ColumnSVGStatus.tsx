import React from 'react';
import { useSelector } from 'react-redux';
import { Tooltip } from 'antd';
import { Button, Icon, Label } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import { RootState } from 'store';
import { Flex } from 'components/Common';
import { translateError } from 'utils/handleError';

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
    <Label size="medium" variant="danger">
      <Flex align justify>
        <span style={{ marginRight: '2px' }}>Failed</span>
        <Tooltip title={error}>
          <Icon type="Info" />
        </Tooltip>
      </Flex>
    </Label>
  ),
});
