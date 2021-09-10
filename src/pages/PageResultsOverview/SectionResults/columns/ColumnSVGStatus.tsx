import React from 'react';
import { Button, Icon, Label } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import { Flex } from 'components/Common';
import { useConvertToSVG } from 'hooks';

type Props = { fileId: number };

export default function ColumnSVGStatus({ fileId }: Props) {
  const { convertStatus, svgId } = useConvertToSVG([fileId]);

  const onSVGViewClick = () => {
    const url = createLink(`/explore/file/${svgId}`);
    window.open(url, '_blank');
  };

  const statusMap = convertStatusMap(onSVGViewClick);
  const status = statusMap[convertStatus] ?? 'N/A';

  return <Flex align>{status}</Flex>;
}

const convertStatusMap = (
  onSVGViewClick: () => void
): { [key: string]: JSX.Element } => ({
  Queued: <Icon type="LoadingSpinner" />,
  Distributed: <Icon type="LoadingSpinner" />,
  Running: <Icon type="LoadingSpinner" />,
  Collecting: <Icon type="LoadingSpinner" />,
  Completed: (
    <Button size="small" type="tertiary" onClick={onSVGViewClick}>
      View SVG
    </Button>
  ),
  Failed: (
    <Label size="medium" variant="danger">
      Failed
    </Label>
  ),
});
