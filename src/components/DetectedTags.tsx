import React from 'react';
import { useAnnotationCount } from '@cognite/data-exploration';
import Spin from 'antd/lib/spin';
import { Flex, CountTag } from 'components/Common';

type DetectedTagsProps = {
  fileId: number;
};

const DetectedTags = ({ fileId }: DetectedTagsProps) => {
  const {
    data: assetAnnotationsCount,
    isFetching: isFetchingAssetsCount,
  } = useAnnotationCount(fileId, 'assets');
  const {
    data: filesAnnotationsCount,
    isFetching: isFetchingFilesCount,
  } = useAnnotationCount(fileId, 'files');

  if (isFetchingAssetsCount || isFetchingFilesCount) return <Spin />;
  return (
    <Flex>
      <CountTag type="assets" value={assetAnnotationsCount} draft={false} />
      <CountTag type="files" value={filesAnnotationsCount} draft={false} />
    </Flex>
  );
};

export default DetectedTags;
