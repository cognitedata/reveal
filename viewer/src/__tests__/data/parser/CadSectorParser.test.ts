/*!
 * Copyright 2020 Cognite AS
 */

import { ParseSectorDelegate } from '../../../models/cad/delegates';
import { SectorQuads, Sector } from '../../../models/cad/types';
import { CADSectorParser } from '../../../data/parser/CADSectorParser';
import { of } from 'rxjs';

describe('CadSectorParser', () => {
  test('parse i3d format', async () => {
    // Arrange
    const detailedParser: ParseSectorDelegate<Sector> = jest.fn(() => Promise.resolve(({} as any) as Sector));
    const simpleParser: ParseSectorDelegate<SectorQuads> = jest.fn(() => Promise.resolve(({} as any) as SectorQuads));
    const parser = new CADSectorParser(detailedParser, simpleParser);
    const operator = parser.parse();

    // Act
    const observable = of({ format: 'i3d', data: new Uint8Array() });
    await operator(observable).toPromise();

    // Assert
    expect(detailedParser).toBeCalledTimes(1);
    expect(simpleParser).not.toBeCalled();
  });

  test('parse f3d format', async () => {
    // Arrange
    const detailedParser: ParseSectorDelegate<Sector> = jest.fn(() => Promise.resolve(({} as any) as Sector));
    const simpleParser: ParseSectorDelegate<SectorQuads> = jest.fn(() => Promise.resolve(({} as any) as SectorQuads));
    const parser = new CADSectorParser(detailedParser, simpleParser);
    const operator = parser.parse();

    // Act
    const observable = of({ format: 'f3d', data: new Uint8Array() });
    await operator(observable).toPromise();

    // Assert
    expect(detailedParser).not.toBeCalled();
    expect(simpleParser).toBeCalledTimes(1);
  });

  test('parse other format, ignored', async () => {
    // Arrange
    const detailedParser: ParseSectorDelegate<Sector> = jest.fn(() => Promise.resolve(({} as any) as Sector));
    const simpleParser: ParseSectorDelegate<SectorQuads> = jest.fn(() => Promise.resolve(({} as any) as SectorQuads));
    const parser = new CADSectorParser(detailedParser, simpleParser);
    const operator = parser.parse();

    // Act
    const observable = of({ format: 'i3d', data: new Uint8Array() });
    await operator(observable).toPromise();

    // Assert
    expect(detailedParser).not.toBeCalled();
    expect(simpleParser).not.toBeCalled();
  });
});
