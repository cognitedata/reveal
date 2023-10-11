import { AnnotationFilterType } from '../../../../FilterSidePanel/types';
import { VisionFile } from '../../../store/files/types';
import { EditPanelState } from '../bulkEditOptions';
import { BulkEditTableDataType } from '../BulkEditTable/BulkEditTable';

const getDataForAnnotation = ({
  files,
  annotationFilter,
  annotationThresholds,
}: {
  files: VisionFile[];
  annotationFilter?: AnnotationFilterType;
  annotationThresholds?: [number, number];
}): BulkEditTableDataType[] => {
  return files.map((file) => {
    const { name, id } = file;
    return {
      name,
      id,
      annotationFilter,
      annotationThresholds,
    };
  });
};

export const getDataForAnnotationFilteredByState = ({
  selectedFiles,
  editPanelState,
}: {
  selectedFiles: VisionFile[];
  editPanelState: EditPanelState;
}): BulkEditTableDataType[] => {
  return getDataForAnnotation({
    files: selectedFiles,
    annotationFilter: editPanelState.annotationFilterType,
  });
};

export const getDataForAnnotationsFilteredByConfidence = ({
  selectedFiles,
  editPanelState,
}: {
  selectedFiles: VisionFile[];
  editPanelState: EditPanelState;
}): BulkEditTableDataType[] => {
  return getDataForAnnotation({
    files: selectedFiles,
    annotationThresholds: editPanelState.annotationThresholds,
  });
};
