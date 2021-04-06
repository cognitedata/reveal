import React from 'react';
import { Colors, Badge, Body } from '@cognite/cogs.js';
import { Spin, Popover } from 'antd';
import { selectAnnotationColor } from 'utils/AnnotationUtils';
import { useAnnotations } from '@cognite/data-exploration';
import { stubAnnotation } from './utils';

type Props = { file: any };
export default function TagsDetectedNew({ file }: Props): JSX.Element {
  const { parsingJob } = file;

  const { data: allAnnotations } = useAnnotations(file.id, undefined, true);
  const newAnnotations = allAnnotations.filter(
    (el) => el.source === `job:${parsingJob?.jobId}`
  );

  if (!parsingJob || !parsingJob.jobDone) {
    return <Spin size="small" />;
  }

  const newAssets = newAnnotations.filter(
    (el: any) => el.resourceType === 'asset'
  ).length;
  const newFiles = newAnnotations.filter(
    (el: any) => el.resourceType === 'file'
  ).length;
  const leftOver = newAnnotations.length - newAssets - newFiles;

  return (
    <Popover
      title="New detected tags"
      placement="bottomLeft"
      content={
        <>
          <Body level={2}>
            <Badge
              background={selectAnnotationColor({
                resourceType: 'file',
                ...stubAnnotation,
              })}
              size={14}
              text={`${newFiles}`}
            />{' '}
            File tags
          </Body>
          <Body level={2}>
            <Badge
              background={selectAnnotationColor({
                resourceType: 'asset',
                ...stubAnnotation,
              })}
              size={14}
              text={`${newAssets}`}
            />{' '}
            Asset tags
          </Body>
          <Body level={2}>
            <Badge
              background={selectAnnotationColor({
                ...stubAnnotation,
              })}
              size={14}
              text={`${leftOver}`}
            />{' '}
            Unclassified tags
          </Body>
        </>
      }
    >
      <Body level={2}>
        <Badge
          background={Colors.midblue.hex()}
          text={`${newAnnotations.length}`}
          size={14}
        />{' '}
        New Tags
      </Body>
    </Popover>
  );
}
