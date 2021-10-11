import { getElementById, isEnterPressed } from '_helpers/general.helper';

describe('General helpers', () => {
  it('check invalid event', () => {
    const event: any = new KeyboardEvent('keydown', { key: 'keydown' });
    const result = isEnterPressed(event);
    expect(result).toBeFalsy();
  });
  it('check enter event', () => {
    const event: any = new KeyboardEvent('Enter', { key: 'Enter' });
    const result = isEnterPressed(event);
    expect(result).toBeTruthy();
  });

  it('should not return element', () => {
    const rootElement = getElementById('invlid name');
    expect(rootElement).not.toBeInTheDocument();
  });
});
