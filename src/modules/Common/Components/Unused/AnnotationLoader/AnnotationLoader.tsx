import { useDispatch } from 'react-redux';
import React, { ReactElement, useEffect, useMemo } from 'react';
import { ResultData } from 'src/modules/Common/types';
import { setLoadingAnnotations } from 'src/modules/Explorer/store/slice';
import { RetrieveAnnotationsV1 } from 'src/store/thunks/Annotation/RetrieveAnnotationsV1';

// todo: remove if not needed
/**
 * Unused component
 * @param props
 * @constructor
 */
export function AnnotationLoader(props: {
  children: ReactElement<{ data: ResultData[] }>;
  data: ResultData[];
}) {
  const dispatch = useDispatch();
  const fileIds = useMemo(() => {
    return props.data.map((item: ResultData) => item.id);
  }, [props.data]);

  useEffect(() => {
    if (fileIds && fileIds.length) {
      dispatch(setLoadingAnnotations());
      dispatch(RetrieveAnnotationsV1({ fileIds, clearCache: true }));
    }
  }, [fileIds]);

  return (
    <>
      {React.Children.only(
        React.cloneElement(props.children, { data: props.data })
      )}
    </>
  );
}
