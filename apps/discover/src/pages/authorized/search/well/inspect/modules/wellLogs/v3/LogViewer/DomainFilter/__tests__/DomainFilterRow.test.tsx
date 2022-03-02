import { fireEvent, screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { DomainFilterRow } from '../DomainFilterRow';
import { DomainFilterRowProps, DomainListItem } from '../types';

describe('DomainFilterRow', () => {
  const domainListItem: DomainListItem = {
    columnExternalId: 'TEST_COLUMN_EXTERNAL_ID',
    min: 0,
    max: 100,
  };
  const onChangeDomain = jest.fn();

  const defaultProps: DomainFilterRowProps = {
    domainListItem,
    onChangeDomain,
  };

  const renderComponent = (props: DomainFilterRowProps = defaultProps) => {
    return testRenderer(DomainFilterRow, undefined, props);
  };

  it('should render domain filter row', () => {
    renderComponent();

    expect(screen.getByTestId('domain-filter-row')).toBeInTheDocument();
    expect(screen.getByTestId('domain-min-value')).toBeInTheDocument();
    expect(screen.getByTestId('domain-max-value')).toBeInTheDocument();
  });

  it('should change domain min value', () => {
    renderComponent();

    const input = screen.getByTestId('domain-min-value');
    const targetValue = 25;
    fireEvent.change(input, { target: { value: targetValue } });

    expect(onChangeDomain).toHaveBeenCalledTimes(1);
    expect(onChangeDomain).toHaveBeenCalledWith(
      domainListItem.columnExternalId,
      'min',
      targetValue
    );
  });

  it('should change domain max value', () => {
    renderComponent();

    const input = screen.getByTestId('domain-max-value');
    const targetValue = 75;
    fireEvent.change(input, { target: { value: targetValue } });

    expect(onChangeDomain).toHaveBeenCalledTimes(1);
    expect(onChangeDomain).toHaveBeenCalledWith(
      domainListItem.columnExternalId,
      'max',
      targetValue
    );
  });
});
