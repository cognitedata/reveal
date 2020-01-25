/*!
 * Copyright 2020 Cognite AS
 */

import { loadLocalCadMetadata } from '../../../../datasources/local/cad/loadLocalCadMetadata';

describe('loadLocalCadMetadata', () => {
  const singleSectorResponse =
    '{"ProjectId":123,"ModelId":456,"RevisionId":789,"SubrevisionId":999,"SectorId":0,"ParentId":null,"Path":"0/","Depth":2,"BoundingBox":{"Min":{"X":319.310028,"Y":82.06455,"Z":459.384},"Max":{"X":356.740021,"Y":124.95504,"Z":517.192}},"FileId":1331885983,"Files":{"1":1331885983,"2":1642093787,"3":1622861214,"5":477710090,"6":1793394194,"7":1324920441},"Metadata":null,"Fields":{"Paths":["project_id","model_id","revision_id","subrevision_id","sector_id","parent_id","path","depth","bounding_box","file_id","files"]}}';
  const twoSectorsResponse = `{"ProjectId":123,"ModelId":456,"RevisionId":789,"SubrevisionId":999,"SectorId":0,"ParentId":null,"Path":"0/","Depth":2,"BoundingBox":{"Min":{"X":319.310028,"Y":82.06455,"Z":459.384},"Max":{"X":356.740021,"Y":124.95504,"Z":517.192}},"FileId":1331885983,"Files":{"1":1331885983,"2":1642093787,"3":1622861214,"5":477710090,"6":1793394194,"7":1324920441},"Metadata":null,"Fields":{"Paths":["project_id","model_id","revision_id","subrevision_id","sector_id","parent_id","path","depth","bounding_box","file_id","files"]}}
    {"ProjectId":123,"ModelId":456,"RevisionId":789,"SubrevisionId":999,"SectorId":1,"ParentId":{"Value":0},"Path":"0/0/","Depth":3,"BoundingBox":{"Min":{"X":319.310028,"Y":82.24396,"Z":459.384},"Max":{"X":356.740021,"Y":124.95504,"Z":504.436981}},"FileId":192953786,"Files":{"1":192953786,"2":1026730633,"3":50421286,"5":419323985,"6":744449991,"7":612363424},"Metadata":null,"Fields":{"Paths":["project_id","model_id","revision_id","subrevision_id","sector_id","parent_id","path","depth","bounding_box","file_id","files"]}}`;

  test('valid response with single sector, returns valid definition', async () => {
    fetchMock.mockResponseOnce(singleSectorResponse);

    const sectors = await loadLocalCadMetadata('/uploaded_sectors.txt');
    expect(sectors.length).toBe(1);
    expect(sectors[0].id).toBeDefined();
    expect(sectors[0].parentId).toBeDefined();
    expect(sectors[0].boundingBox).toBeDefined();
    expect(sectors[0].boundingBox.min).toBeDefined();
    expect(sectors[0].boundingBox.max).toBeDefined();
    expect(sectors[0].depth).toBeDefined();
    expect(sectors[0].threedFiles).toBeDefined();
  });

  test('valid response with two sectors, returns definitions', async () => {
    fetchMock.mockResponseOnce(twoSectorsResponse);

    const sectors = await loadLocalCadMetadata('/uploaded_sectors.txt');
    expect(sectors.length).toBe(2);
  });

  test('response is 404, throws', async () => {
    expect.assertions(1);
    fetchMock.mockResponseOnce('', { status: 404 });

    await expect(loadLocalCadMetadata('/uploaded_sectors.txt')).rejects.toThrow();
  });

  test('response contains empty line, ignored', async () => {
    fetchMock.mockResponseOnce(singleSectorResponse + '\n');

    const sectors = await loadLocalCadMetadata('/uploaded_sectors.txt');

    expect(sectors.length).toBe(1);
  });
});
