import React from 'react';
import Spin from 'antd/lib/spin';
import { Flex, CountTag } from 'components/Common';
import useAnnotationsDetails from 'hooks/useAnnotationsDetails';
import { Body, Colors } from '@cognite/cogs.js';

type DetectedTagsProps = {
  fileId: number;
};

const DetectedTags = ({ fileId }: DetectedTagsProps) => {
  const { assetTags, fileTags, pendingAssetTags, pendingFileTags, isFetched } =
    useAnnotationsDetails(fileId);

  const noTags = !assetTags.length && !fileTags.length;

  if (!isFetched) return <Spin />;

  if (noTags)
    return (
      <Body level={2} style={{ color: Colors['greyscale-grey6'].hex() }}>
        No links
      </Body>
    );

  const renderTooltip = (assets?: boolean) => {
    const type = assets ? 'asset' : 'file';
    const tags = assets ? assetTags : fileTags;
    const pendingTags = assets ? pendingAssetTags : pendingFileTags;

    if (pendingTags?.length) {
      return (
        <Body style={{ color: 'white' }}>
          {pendingTags.length} {type} tags pending review
        </Body>
      );
    }
    if (tags?.length)
      return (
        <Body style={{ color: 'white' }}>
          {tags.length} {type} tags approved
        </Body>
      );

    return <Body style={{ color: 'white' }}>No {type} tags detected</Body>;
  };

  return (
    <Flex>
      <CountTag
        type="assets"
        value={assetTags?.length ?? 0}
        pending={!!pendingAssetTags?.length}
        tooltipContent={renderTooltip(true)}
      />
      <CountTag
        type="files"
        value={fileTags?.length ?? 0}
        pending={!!pendingFileTags?.length}
        tooltipContent={renderTooltip(false)}
      />
    </Flex>
  );
};

export default DetectedTags;
