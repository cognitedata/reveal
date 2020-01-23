/*!
 * Copyright 2019 Cognite AS
 */

import { loadLocalFileMap } from '../../../../datasources/local/cad/loadLocalFileMap';

describe('loadLocalFileMap', () => {
  const fileMapBody = `734862805\t\t\tweb_node_7_115.f3d
  1024632548\t  \tweb_node_7_116.i3d
1157498855\t\t  web_node_7_116.f3d   
1717535321  \t\tweb_node_7_117.i3d`;

  test('request returns 404, throws', async () => {
    fetchMock.mockResponse('', { status: 404 });
    await expect(loadLocalFileMap('/uploaded_files.txt')).rejects.toThrowError();
  });

  test('valid data, returns map', async () => {
    fetchMock.mockResponse(fileMapBody);
    const map = await loadLocalFileMap('/uploaded_files.txt');
    expect(map.size).toBe(4);
    expect(map.get(734862805)).toBe('web_node_7_115.f3d');
    expect(map.get(1024632548)).toBe('web_node_7_116.i3d');
    expect(map.get(1157498855)).toBe('web_node_7_116.f3d');
    expect(map.get(1717535321)).toBe('web_node_7_117.i3d');
  });
});
