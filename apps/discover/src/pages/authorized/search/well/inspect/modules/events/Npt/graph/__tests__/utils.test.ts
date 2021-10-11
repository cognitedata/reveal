import { getNptCodeCheckboxOptions } from '../utils';

describe('NPT Graph -> utils', () => {
  it('should return data options with checkbox state', () => {
    const data = [
      { label: 'Label2', count: 1.2, stackedWidth: 1.2 },
      { label: 'Label1', count: 2.52, stackedWidth: 3.72 },
      { label: 'Label1', count: 4.2, stackedWidth: 7.92 },
      { label: 'Label1', count: 4.5, stackedWidth: 12.42 },
      { label: 'Label2', count: 16, stackedWidth: 28.42 },
    ];

    const { checkboxState, dataOption } = getNptCodeCheckboxOptions(
      data,
      'label'
    );
    expect(checkboxState).toEqual({ Label1: true, Label2: true });
    expect(dataOption).toEqual(['Label1', 'Label2']);
  });
});
