import { FileInfo } from '@cognite/sdk';

const randomId = () => Math.round(Math.random() * 10000000);

export class MockFiles {
  static documentTypes = ['PID', 'SLD', undefined];

  static single = (overwrites?: Partial<FileInfo>, i?: number): FileInfo => {
    const id = randomId();
    const type = this.documentTypes[(i || 0) % this.documentTypes.length] || '';
    return {
      id,
      name: `${type}_${id}`,
      uploaded: true,
      uploadedTime: new Date(),
      lastUpdatedTime: new Date(),
      createdTime: new Date(),
      metadata: {
        documentType: type,
        documentDescription: `[${type}] Schematic document of asset`,
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
