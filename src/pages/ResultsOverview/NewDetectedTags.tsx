import React from 'react';
import { useSelector } from 'react-redux';
import { Colors, Badge, Body } from '@cognite/cogs.js';
import { Spin, Popover } from 'antd';
import { selectAnnotationsForSource } from 'modules/annotations';
import { selectAnnotationColor } from 'components/CogniteFileViewer/CogniteFileViewerUtils';
import { stubAnnotation } from './ResultsTable';

export default function NewDetectedTags({ file }: { file: any }): JSX.Element {
  const { parsingJob } = file;
  const annotationBySourceMap = useSelector(selectAnnotationsForSource);

  if (!parsingJob || !parsingJob.jobDone) {
    return <Spin size="small" />;
  }

  const annotations = annotationBySourceMap(file.id, `job:${parsingJob.jobId}`);
  const newAssets = annotations.filter((el: any) => el.resourceType === 'asset')
    .length;
  const newFiles = annotations.filter((el: any) => el.resourceType === 'file')
    .length;
  const leftOver = annotations.length - newAssets - newFiles;

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
          text={`${annotations.length}`}
          size={14}
        />{' '}
        New Tags
      </Body>
    </Popover>
  );
}
