import { EditPanelState } from 'src/modules/Common/Components/BulkEdit/bulkEditOptions';
import { BulkEditTableDataType } from 'src/modules/Common/Components/BulkEdit/BulkEditTable/BulkEditTable';
import { VisionFile } from 'src/modules/Common/store/files/types';
import { AnnotationFilterType } from 'src/modules/FilterSidePanel/types';

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
