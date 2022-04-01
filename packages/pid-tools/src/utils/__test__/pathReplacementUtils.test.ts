import { PathReplacementGroup } from '../..';
import { getPathReplacementId } from '../diagramInstanceUtils';
import { getPathReplacementDescendants } from '../pathReplacementUtils';

describe('pathReplacementUtils', () => {
  test('getPathReplacementDescendants', async () => {
    const replacements = [
      [
        {
          pathId: 'path1588',
          replacementPaths: [
            {
              svgCommands: 'M 1371.466796875 314.3732604980469 v 9.52001953125',
              id: 'path1588_1',
            },
          ],
        },
        {
          pathId: 'path1158',
          replacementPaths: [
            {
              svgCommands:
                'M 1427.146728515625 312.3732604980469 h -53.679931640625',
              id: 'path1158_1',
            },
            {
              svgCommands:
                'M 1369.466796875 312.3732604980469 h -68.7200927734375',
              id: 'path1158_2',
            },
            {
              svgCommands:
                'M 1373.466796875 312.3732604980469 h -4 M 1371.466796875 312.3732604980469 v 2',
              id: 'path1158_tjunction',
            },
          ],
        },
      ],
      [
        {
          pathId: 'path416',
          replacementPaths: [
            {
              svgCommands:
                'M 1255.7867431640625 314.3732604980469 v 54.32000732421875 h -82.0799560546875',
              id: 'path416_1',
            },
          ],
        },
        {
          pathId: 'path1154',
          replacementPaths: [
            {
              svgCommands:
                'M 1241.0667724609375 312.3732604980469 h 12.719970703125',
              id: 'path1154_1',
            },
            {
              svgCommands:
                'M 1257.7867431640625 312.3732604980469 h 11.4400634765625',
              id: 'path1154_2',
            },
            {
              svgCommands:
                'M 1253.7867431640625 312.3732604980469 h 4 M 1255.7867431640625 312.3732604980469 v 2',
              id: 'path1154_tjunction',
            },
          ],
        },
      ],
      [
        {
          pathId: 'path1604',
          replacementPaths: [
            {
              svgCommands:
                'M 1348.5867919921875 310.3732604980469 v -9.839996337890625',
              id: 'path1604_1',
            },
          ],
        },
        {
          pathId: 'path1158_2',
          replacementPaths: [
            {
              svgCommands:
                'M 1369.466796875 312.3732604980469 h -18.8800048828125',
              id: 'path1158_2_1',
            },
            {
              svgCommands:
                'M 1346.5867919921875 312.3732604980469 h -45.840087890625',
              id: 'path1158_2_2',
            },
            {
              svgCommands:
                'M 1350.5867919921875 312.3732604980469 h -4 M 1348.5867919921875 312.3732604980469 v -2',
              id: 'path1158_2_tjunction',
            },
          ],
        },
      ],
      [
        {
          pathId: 'path1570',
          replacementPaths: [
            {
              svgCommands:
                'M 1335.94677734375 314.3732604980469 v 9.52001953125',
              id: 'path1570_1',
            },
          ],
        },
        {
          pathId: 'path1158_2_2',
          replacementPaths: [
            {
              svgCommands:
                'M 1346.5867919921875 312.3732604980469 h -8.6400146484375',
              id: 'path1158_2_2_1',
            },
            {
              svgCommands:
                'M 1333.94677734375 312.3732604980469 h -33.2000732421875',
              id: 'path1158_2_2_2',
            },
            {
              svgCommands:
                'M 1337.94677734375 312.3732604980469 h -4 M 1335.94677734375 312.3732604980469 v 2',
              id: 'path1158_2_2_tjunction',
            },
          ],
        },
      ],
    ];

    const pathReplacementGroups: PathReplacementGroup[] = [
      {
        type: 'T-junction',
        id: getPathReplacementId(replacements[0]),
        replacements: replacements[0],
      },
      {
        type: 'T-junction',
        id: getPathReplacementId(replacements[1]),
        replacements: replacements[1],
      },
      {
        type: 'T-junction',
        id: getPathReplacementId(replacements[2]),
        replacements: replacements[2],
      },
      {
        type: 'T-junction',
        id: getPathReplacementId(replacements[3]),
        replacements: replacements[3],
      },
    ];

    // How path replacements are made:
    // pr[3] <- pr[2] <- pr[0]
    // pr[1]
    expect(
      getPathReplacementDescendants(
        getPathReplacementId(pathReplacementGroups[0].replacements),
        pathReplacementGroups
      ).length
    ).toBe(3);

    expect(
      getPathReplacementDescendants(
        getPathReplacementId(pathReplacementGroups[1].replacements),
        pathReplacementGroups
      ).length
    ).toBe(1);

    expect(
      getPathReplacementDescendants(
        getPathReplacementId(pathReplacementGroups[2].replacements),
        pathReplacementGroups
      ).length
    ).toBe(2);

    expect(
      getPathReplacementDescendants(
        getPathReplacementId(pathReplacementGroups[3].replacements),
        pathReplacementGroups
      ).length
    ).toBe(1);
  });
});
