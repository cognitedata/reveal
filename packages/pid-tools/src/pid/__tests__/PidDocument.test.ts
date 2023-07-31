import { PidDocument } from '../PidDocument';

describe('Serialize and deserialize', () => {
  test('fromNormalizedSvgString', () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
<?xml version="1.0" encoding="UTF-8" standalone="no"?>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.00 0.00 1122.67 793.33">
    <path d="M 0,0 h 100 v 100" id="path001" />
    <path d="M 100,100 l 10,10" id="path002" />
</svg>
    `);
    expect(pidDocument.pidPaths.length).toEqual(2);
    expect(pidDocument.pidPaths[0].pathId).toEqual('path001');
    expect(pidDocument.pidPaths[1].pathId).toEqual('path002');
  });

  test('toSvg and fromNormalizedSvgString', () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
<?xml version="1.0" encoding="UTF-8" standalone="no"?>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.00 0.00 1122.67 793.33">
    <path d="M 0,0 h 100 v 100" id="path001" />
    <path d="M 100,100 l 10,10" id="path002" />
</svg>
    `);

    const pidDocument2 = PidDocument.fromNormalizedSvgString(
      pidDocument.toSvgString()
    );
    expect(pidDocument.pidPaths.length).toEqual(pidDocument2.pidPaths.length);
    pidDocument.pidPaths.forEach((pidPath, index) => {
      expect(pidPath.pathId).toEqual(pidDocument2.pidPaths[index].pathId);
      expect(pidPath.segmentList[0].start).toEqual(
        pidDocument2.pidPaths[index].segmentList[0].start
      );
    });
  });
});
