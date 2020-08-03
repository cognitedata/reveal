import React from 'react';
import { IAnnotation, IRectShapeData } from '@cognite/react-picture-annotation';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { selectAnnotations } from 'modules/annotations';
import sdk from 'sdk-singleton';
import { itemSelector as fileSelector } from 'modules/files';
import { FileViewer } from 'components/Common';
import { selectAnnotationColor } from './CogniteFileViewerUtils';

const Wrapper = styled.div`
  flex: 1;
  min-height: 200px;
  height: 100%;
  width: 100%;
  position: relative;
`;

type Props = {
  fileId?: number;
  children?: React.ReactNode;
};

export const CogniteFileViewerImage = ({ fileId }: Props) => {
  const filesMap = useSelector(fileSelector);
  const pnidAnnotations = useSelector(selectAnnotations)(fileId);

  const annotations = pnidAnnotations
    .filter(el => el.page === 1 || el.page === undefined)
    .map(el => {
      return {
        id: `${el.id}`,
        comment: el.label || 'No Label',
        mark: {
          type: 'RECT',
          x: el.box.xMin,
          y: el.box.yMin,
          width: el.box.xMax - el.box.xMin,
          height: el.box.yMax - el.box.yMin,
          strokeWidth: 2,
          strokeColor: selectAnnotationColor(el, false),
        },
      } as IAnnotation<IRectShapeData>;
    });

  return (
    <Wrapper>
      <FileViewer
        sdk={sdk}
        file={filesMap(fileId)}
        annotations={annotations}
        drawLabel={false}
        hidePagination
        renderItemPreview={() => <></>}
      />
    </Wrapper>
  );
};
