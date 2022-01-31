import { useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import isEqual from 'lodash/isEqual';
import { FileInfo } from '@cognite/sdk';
import {
  CogniteAnnotation,
  summarizeAssetIdsFromAnnotations,
} from '@cognite/annotations';
import { RootState } from 'store';
import { AppStateContext } from 'context';
import { useAnnotationsForFiles } from 'hooks';
import { itemSelector as assetSelector } from 'modules/assets';
import { itemSelector as fileSelector } from 'modules/files';
import { boundingBoxToVertices } from 'modules/workflows';
import { startConvertFileToSvgJob } from 'modules/svgConvert';
import { Vertices } from 'modules/types';

type DiagramToConvert = {
  fileName: string;
  fileId: number;
  annotations: {
    text: string;
    region: { shape: string; vertices: Vertices };
  }[];
  assetIds: number[];
};

export const useConvertToSVG = (fileIds: number[]) => {
  const dispatch = useDispatch();
  const { svgPrefix, prefixType } = useContext(AppStateContext);
  const [isConverting, setIsConverting] = useState(false);
  const { diagramsToConvert, nrOfPendingDiagramsToConvert } =
    useDiagramsToConvert(fileIds);
  const { status: convertStatus, svgId } = useSelector(
    (state: RootState) => state.svgConvert[fileIds[0]] ?? {}
  );

  useEffect(() => {
    if (
      convertStatus &&
      convertStatus !== 'Completed' &&
      convertStatus !== 'Failed'
    )
      setIsConverting(true);
    else setIsConverting(false);
  }, [convertStatus]);

  const convertDiagramsToSVG = async () => {
    if (diagramsToConvert?.length)
      dispatch(
        startConvertFileToSvgJob.action({
          diagrams: diagramsToConvert,
          prefix: prefixType === 'custom' ? svgPrefix : undefined,
        })
      );
  };

  return {
    convertDiagramsToSVG,
    nrOfPendingDiagramsToConvert,
    convertStatus,
    svgId,
    isConverting,
  };
};

export const useDiagramsToConvert = (fileIds: number[]) => {
  const getFile: any = useSelector(fileSelector);
  const labelsForAnnotations = useSelector(selectLabelsForAnnotations);
  const { annotations: annotationsMap } = useAnnotationsForFiles(fileIds);

  const [diagramsToConvert, setDiagramsToConvert] = useState<
    DiagramToConvert[]
  >([]);
  const [nrOfPendingDiagramsToConvert, setNrOfpendingDiagramsToConvert] =
    useState<number>(0);

  useEffect(() => {
    const pendingDiagrams = fileIds.filter(
      (fileId: number) =>
        Boolean(annotationsMap[fileId]) &&
        annotationsMap[fileId].find((an) => an.status === 'unhandled')
    ).length;
    const diagrams = fileIds
      .filter((fileId: number) => Boolean(annotationsMap[fileId]))
      .map((fileId: number) => {
        const annotations = annotationsMap[fileId].filter(
          (an) => an.status === 'verified'
        );
        const file: FileInfo = getFile(fileId);
        const [item] = summarizeAssetIdsFromAnnotations(annotations);
        const assetIds = Array.from(item?.assetIds ?? []) as number[];
        const annotationsWithLabels = labelsForAnnotations(annotations);
        const mappedAnnotations = annotationsWithLabels.map(
          (annotation: CogniteAnnotation) => ({
            text: annotation.label,
            region: {
              shape: 'rectangle',
              vertices: boundingBoxToVertices(annotation.box),
            },
          })
        );
        return {
          fileName: file?.name ?? '',
          fileId,
          annotations: mappedAnnotations,
          assetIds,
        };
      });
    if (!isEqual(diagrams, diagramsToConvert)) setDiagramsToConvert(diagrams);
    if (!isEqual(pendingDiagrams, nrOfPendingDiagramsToConvert))
      setNrOfpendingDiagramsToConvert(pendingDiagrams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileIds, annotationsMap]);

  return { diagramsToConvert, nrOfPendingDiagramsToConvert };
};

export const selectLabelsForAnnotations = createSelector(
  assetSelector,
  fileSelector,
  (assets: any, files: any) => (annotations: CogniteAnnotation[]) => {
    const annotationLabel = (annotation: CogniteAnnotation) => {
      switch (annotation.resourceType) {
        case 'asset': {
          const asset = assets(
            annotation.resourceExternalId || annotation.resourceId
          );
          return asset?.name;
        }
        case 'file': {
          const file = files(
            annotation.resourceExternalId || annotation.resourceId
          );
          return file?.name;
        }
        default:
          return undefined;
      }
    };
    return annotations.map((annotation) => {
      const label =
        annotationLabel(annotation) || annotation.label || 'No label';
      return {
        ...annotation,
        label,
      } as CogniteAnnotation;
    });
  }
);
