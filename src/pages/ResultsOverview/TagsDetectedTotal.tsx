import React from 'react';
import { useSelector } from 'react-redux';
import { FileInfo } from '@cognite/sdk';
import { Badge, Body } from '@cognite/cogs.js';
import { Spin, Popover } from 'antd';
import { selectAnnotations } from 'modules/annotations';
import {
  getPnIdAnnotationCategories,
  selectAnnotationColor,
} from 'utils/AnnotationUtils';
import { Flex } from 'components/Common';
import { stubAnnotation } from './utils';

type Props = { file: FileInfo };

export default function TagsDetectedTotal({ file }: Props): JSX.Element {
  const annotationsMap = useSelector(selectAnnotations);
  const annotations = annotationsMap(file.id);

  if (!annotations) {
    return <Spin size="small" />;
  }

  const annotationDetails = getPnIdAnnotationCategories(annotations);

  const {
    Asset: { count: assetCount },
    File: { count: fileCount },
    Unclassified: { count: unclassifiedCount },
  } = annotationDetails;

  const totalTagsPopover = Object.keys(annotationDetails).map((key) => {
    const { count, items } = annotationDetails[key];
    return (
      <Flex key={key} column style={{ marginBottom: '12px' }}>
        <Flex style={{ marginBottom: '4px', fontWeight: 'bold' }}>
          {count} {key} Linked Tags
        </Flex>
        {Object.keys(items).map((subKey) => (
          <Flex
            align
            key={subKey}
            style={{ justifyContent: 'space-between', marginBottom: '4px' }}
          >
            <Body level={2}>{subKey}</Body>
            <Body level={2}>
              <Badge
                background={selectAnnotationColor(items[subKey][0])}
                size={14}
                text={`${items[subKey].length}`}
              />
            </Body>
          </Flex>
        ))}
      </Flex>
    );
  });

  return (
    <Popover
      title="Total Detected Linked Tags"
      placement="bottomLeft"
      content={totalTagsPopover}
    >
      <Flex row>
        <Body level={2} style={{ marginRight: '8px' }}>
          <Badge
            background={selectAnnotationColor({
              resourceType: 'file',
              ...stubAnnotation,
            })}
            size={14}
            text={`${fileCount}`}
          />{' '}
          File tags
        </Body>
        <Body level={2} style={{ marginRight: '8px' }}>
          <Badge
            background={selectAnnotationColor({
              resourceType: 'asset',
              ...stubAnnotation,
            })}
            size={14}
            text={`${assetCount}`}
          />{' '}
          Asset tags
        </Body>
        <Body level={2}>
          <Badge
            background={selectAnnotationColor({
              ...stubAnnotation,
            })}
            size={14}
            text={`${unclassifiedCount}`}
          />{' '}
          Unclassified tags
        </Body>
      </Flex>
    </Popover>
  );
}
