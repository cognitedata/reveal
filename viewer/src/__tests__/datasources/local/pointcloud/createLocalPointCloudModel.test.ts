/*!
 * Copyright 2020 Cognite AS
 */

// @ts-ignore
import * as Potree from '@cognite/potree-core';
import { createLocalPointCloudModel } from '@/dataModels/pointCloud/public/createLocalPointCloudModel';

const mockPointCloudLoad = jest.fn();
jest.mock('../../../../dataModels/pointCloud/internal/potree/PointCloudLoader', () => ({
  PointCloudLoader: class {
    static async load(url: string) {
      mockPointCloudLoad(url);
    }
  }
}));

describe('createLocalPointCloudModel', () => {
  test('calling returned fetchPointcloud() triggers load', async () => {
    // Arrange
    const url = 'http://localhost/points.json';
    const model = await createLocalPointCloudModel(url);
    const [fetchPointcloud] = model;

    // Act
    await fetchPointcloud();

    // Assert
    expect(mockPointCloudLoad).toBeCalledWith(url);
  });
});
