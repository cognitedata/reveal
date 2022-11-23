import { AnnotationModel } from '@cognite/sdk/dist/src';

export const annotations: AnnotationModel[] = [
  {
    id: 1778804844587294,
    annotationType: 'diagrams.AssetLink',
    annotatedResourceType: 'file',
    annotatedResourceId: 123456789,
    data: {
      text: '23-KA-9101',
      textRegion: {
        xMax: 0.11852449103003426,
        xMin: 0.06551098568836929,
        yMax: 0.6778791334093502,
        yMin: 0.6733181299885975,
      },
      assetRef: {
        externalId: '3047932288982463',
      },
    },
    status: 'approved',
    creatingApp: 'migrations',
    creatingAppVersion: '1.0.0',
    createdTime: new Date(1597233855648),
    lastUpdatedTime: new Date(1597233855648),
    creatingUser: 'nabati',
  },
  {
    id: 406167784064508,
    annotationType: 'diagrams.FileLink',
    annotatedResourceType: 'file',
    annotatedResourceId: 123456789,
    data: {
      text: 'Processed-PnID.png',
      textRegion: {
        xMin: 0.6479739313649885,
        yMin: 0.28594249201277955,
        xMax: 0.689768095185634,
        yMax: 0.36741214057507987,
      },
      fileRef: {
        id: 987654321,
      },
    },
    status: 'approved',
    creatingApp: 'migrations',
    creatingAppVersion: '1.0.0',
    createdTime: new Date(1597233855648),
    lastUpdatedTime: new Date(1597233855648),
    creatingUser: 'nabati',
  },
];
