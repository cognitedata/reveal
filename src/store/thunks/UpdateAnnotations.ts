import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { Annotation } from 'src/api/types';

export const UpdateAnnotations = createAsyncThunk<
  any,
  Annotation[],
  ThunkConfig
>('UpdateAnnotations', async (annotations) => {
  const data = {
    data: {
      items: annotations.map((ann) => ({
        id: ann.id,
        update: {
          text: getFieldOrSetNull(ann.text),
          status: getFieldOrSetNull(ann.status),
          region: getFieldOrSetNull(
            ann.region
              ? {
                  shape: ann.region.shape,
                  vertices: ann.region.vertices,
                }
              : null
          ),
          data: getFieldOrSetNull(ann.data),
        },
      })),
    },
  };
  const response = await sdk.post(
    `${sdk.getBaseUrl()}/api/playground/projects/${
      sdk.project
    }/context/annotations/update`,
    data
  );
  return response;
});

const getFieldOrSetNull = (value: any): { set: any } | { setNull: true } => {
  if (value === undefined || value === null) {
    return {
      setNull: true,
    };
  }
  return {
    set: value,
  };
};
