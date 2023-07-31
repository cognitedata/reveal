import { getArrayChangeDetail } from '../getArrayChangeDetail';

describe('getArrayChangeDetail', () => {
  it('should return truthy hasArrayChange & arrayChangePath when change has array on metadata path', () => {
    const { hasArrayChange, arrayChangePath } = getArrayChangeDetail(
      'wells.trajectory.columns',
      {
        wells: {
          label: 'Wells',
          type: 'object',
          children: {
            trajectory: {
              label: 'Trajectory',
              type: 'object',
              children: { columns: { label: 'Columns', type: 'array' } },
            },
          },
        },
      }
    );
    expect(hasArrayChange).toBeTruthy();
    expect(arrayChangePath).toBe('wells.trajectory.columns');
  });

  it('should return truthy hasArrayChange & topmost arrayChangePath when change is in a nested array', () => {
    const { hasArrayChange, arrayChangePath } = getArrayChangeDetail(
      'map.layers.0.name',
      {
        map: {
          label: 'Map',
          type: 'object',
          children: {
            layers: {
              label: 'Layers',
              type: 'array',
              children: { name: { label: 'Name', type: 'string' } },
            },
          },
        },
      }
    );
    expect(hasArrayChange).toBeTruthy();
    expect(arrayChangePath).toBe('map.layers');
  });

  it('should return falsy hasArrayChange & empty arrayChangePath when change type is not array', () => {
    const { hasArrayChange } = getArrayChangeDetail('general.hide', {
      general: {
        label: 'General',
        type: 'object',
        children: {
          hide: {
            label: 'Hide',
            type: 'boolean',
          },
        },
      },
    });
    expect(hasArrayChange).toBeFalsy();
  });

  it('should return falsy hasArrayChange when selectedPath is empty', () => {
    const { hasArrayChange } = getArrayChangeDetail('', {
      general: {
        label: 'General',
        type: 'object',
        children: {
          hide: {
            label: 'Hide',
            type: 'boolean',
          },
        },
      },
    });
    expect(hasArrayChange).toBeFalsy();
  });
});
