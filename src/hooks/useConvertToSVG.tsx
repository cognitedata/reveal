import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAnnotations } from '@cognite/data-exploration';
import { convertEventsToAnnotations } from '@cognite/annotations';
import { startConvertFileToSvgJob } from 'modules/contextualization/uploadJobs';

export const useConvertToSVG = (fileId: number) => {
  const dispatch = useDispatch();
  const { data: annotations } = useAnnotations(fileId);

  const [isConverting, setIsConverting] = useState(false);

  const convertDiagramToSVG = async () => {
    if (annotations) {
      setIsConverting(true);
      await dispatch(
        startConvertFileToSvgJob(
          fileId,
          convertEventsToAnnotations(annotations)
        )
      );
      setIsConverting(false);
    }
  };

  return { convertDiagramToSVG, isConverting };
};
