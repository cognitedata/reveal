import { MutableRefObject, useContext } from 'react';
import { AuthContext } from 'providers/AuthProvider';
import { FileInfo } from '@cognite/sdk';
import {
  CogniteOrnate,
  FileURL,
  getAnnotationsFromCDF,
  getFileFromCDF,
} from 'ornate';
import { v4 as uuid } from 'uuid';

const useBlueprint = (
  ornateViewer: MutableRefObject<CogniteOrnate | undefined>
) => {
  const { client } = useContext(AuthContext);

  const addFile = async (file: FileInfo) => {
    const fileURLShape = new FileURL({
      x: 0,
      y: 0,
      fill: 'red',
      id: uuid(),
      mimeType: file.mimeType,
      fileReference: {
        externalId: file.externalId!,
        id: String(file.id),
      },
      fileName: file.name,
      getURLFunc: getFileFromCDF(client),
      onLoadListeners: [
        (fileURLShape) => {
          ornateViewer.current?.zoomToID(fileURLShape.shape.id());
          ornateViewer.current?.emitSaveEvent();
        },
      ],
      getAnnotationsFunc: getAnnotationsFromCDF(client),
    });
    ornateViewer.current?.addShape([fileURLShape]);
  };

  return { addFile };
};

export default useBlueprint;
