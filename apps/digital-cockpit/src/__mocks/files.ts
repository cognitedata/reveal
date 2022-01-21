import { FileInfo } from '@cognite/sdk';

const randomId = () => Math.round(Math.random() * 10000000);

export class MockFiles {
  static documentTypes = ['PID', 'SLD', undefined];

  static single = (overwrites?: Partial<FileInfo>, i?: number): FileInfo => {
    const id = randomId();
    return {
      id,
      name: `MyFile_${id}`,
      uploaded: true,
      uploadedTime: new Date(),
      lastUpdatedTime: new Date(),
      createdTime: new Date(),
      metadata: {
        documentType:
          this.documentTypes[(i || 0) % this.documentTypes.length] || '',
      },
      ...overwrites,
    };
  };

  static multiple = (amount = 10, overwrites: Partial<FileInfo>[] = []) => {
    const result = [];
    for (let i = 0; i < amount; i++) {
      result.push(this.single(overwrites[i], i));
    }
    return result;
  };
}
