import { FileInfo } from '@cognite/cdf-sdk-singleton';
import React, { ReactElement, useMemo } from 'react';
import { addUploadedFile } from 'src/modules/Common/filesSlice';
import { useDispatch } from 'react-redux';
import {
  getParamLink,
  workflowRoutes,
} from 'src/modules/Workflow/workflowRoutes';
import { useHistory } from 'react-router-dom';

export function ResultAnnotationLoader(props: {
  children: ReactElement<{ data: FileInfo[] }>;
  data: any[];
}) {
  const history = useHistory();
  const dispatch = useDispatch();
  const data = useMemo(() => {
    return props.data.map((file: any) => {
      const fileInfo: FileInfo = {
        ...file,
        createdTime: new Date(file.createdTime),
        uploadedTime: new Date(file.uploadedTime),
        lastUpdatedTime: new Date(file.lastUpdatedTime),
        sourceCreatedTime: file.sourceCreatedTime
          ? new Date(file.sourceCreatedTime)
          : undefined,
      };
      dispatch(addUploadedFile(fileInfo));

      const menuActions = {
        onReviewClick: (fileId: number) => {
          history.push(
            getParamLink(workflowRoutes.review, ':fileId', String(fileId))
          );
        },
      };
      return { ...fileInfo, menu: menuActions };

      // dispatch(
      //   PopulateAnnotations({
      //     fileId: fileInfo.id.toString(),
      //     assetIds: fileInfo.assetIds,
      //   })
      // );
    });
  }, [props.data]);

  return (
    <>{React.Children.only(React.cloneElement(props.children, { data }))}</>
  );
}
