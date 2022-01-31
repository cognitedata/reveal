import { useDispatch } from 'react-redux';
import React, { ReactElement, useEffect, useMemo } from 'react';
import { ResultData } from 'src/modules/Common/types';
import { setLoadingAnnotations } from 'src/modules/Explorer/store/slice';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';

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
      dispatch(RetrieveAnnotations({ fileIds, clearCache: true }));
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
