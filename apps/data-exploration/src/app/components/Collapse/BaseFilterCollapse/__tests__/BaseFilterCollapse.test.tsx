import render from '../../../../../testUtils/render';
import { fireEvent, screen } from '@testing-library/react';
import { BaseFilterPanel, BaseFilterPanelProps } from '../BaseFilterCollapse';
import { RESET } from '../../../Buttons/constants';

describe('BaseFilterPanel', () => {
  const initRender = (props?: Partial<BaseFilterPanelProps>) => {
    render(BaseFilterPanel, undefined, {
      title: 'Test title',
      infoContent: 'Info content',
      children: <div></div>,
      ...props,
    });
  };

  it('should render base filter panel', async () => {
    initRender();

    expect(screen.getByText('Test title')).toBeInTheDocument();
    fireEvent.mouseEnter(screen.getByTestId('header-info-icon'), {
      bubbles: true,
    });
    expect(screen.getByText('Info content')).toBeInTheDocument();
    expect(screen.getByText(RESET)).toBeInTheDocument();
  });

  it('should hide reset button', () => {
    initRender({ hideResetButton: true });

    expect(screen.queryByText(RESET)).not.toBeInTheDocument();
  });

  it('should trigger reset button action', () => {
    const onResetClick = jest.fn();

    initRender({ onResetClick });

    fireEvent.click(screen.getByText(RESET));
    expect(onResetClick).toHaveBeenCalled();
  });
});
