import React, { useMemo } from 'react';
import { Progress, Typography } from 'antd';
import {
  dataKitLengthSelectorFactory,
  dataKitCountSelectorFactory,
} from 'modules/selection';
import { useSelector } from 'react-redux';
import { RootState } from 'reducers';

const { Text } = Typography;

type Props = {
  id: string;
};
export default function DataKitLoadingProgress(props: Props) {
  const { id } = props;
  const { type } = useSelector((state: RootState) => state.selection.items[id]);

  const aggregatedCountSelector = useMemo(
    () => dataKitCountSelectorFactory(id),
    [id]
  );
  const dataKitDownloadedSelector = useMemo(
    () => dataKitLengthSelectorFactory(id, true),
    [id]
  );

  const downloaded = useSelector(dataKitDownloadedSelector);
  const count = useSelector(aggregatedCountSelector);

  const percent: number = parseInt(
    ((count ? downloaded / count : 0) * 100).toFixed(0),
    10
  );
  return (
    <>
      <Text strong>
        Loading {type} (<Text type="secondary">{downloaded}</Text>)
      </Text>
      <Progress
        percent={percent}
        status={percent === 100 ? 'success' : 'active'}
      />
    </>
  );
}
