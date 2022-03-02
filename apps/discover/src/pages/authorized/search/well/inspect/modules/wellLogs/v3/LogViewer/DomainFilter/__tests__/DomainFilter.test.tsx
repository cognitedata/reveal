import { fireEvent, screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { ExpandButton } from 'components/buttons/ExpandButton';

import { DomainFilter } from '../DomainFilter';
import { DomainFilterProps, DomainListItem } from '../types';

const DomainFilterWithExpandButton = (props: DomainFilterProps) => {
  const { domainList, onChangeDomain } = props;
  return (
    <DomainFilter domainList={domainList} onChangeDomain={onChangeDomain}>
      <ExpandButton
        text="Value Range"
        data-testid="domain-filter-expand-button"
      />
    </DomainFilter>
  );
};

describe('DomainFilter', () => {
  const domainListItem1: DomainListItem = {
    columnExternalId: 'TEST_COLUMN_EXTERNAL_ID_1',
    min: 0,
    max: 100,
  };
  const domainListItem2: DomainListItem = {
    columnExternalId: 'TEST_COLUMN_EXTERNAL_ID_2',
    min: 25,
    max: 75,
  };
  const domainList: DomainListItem[] = [domainListItem1, domainListItem2];
  const onChangeDomain = jest.fn();

  const defaultProps: DomainFilterProps = {
    domainList,
    onChangeDomain,
  };

  const renderComponent = (props: DomainFilterProps = defaultProps) => {
    return testRenderer(DomainFilterWithExpandButton, undefined, props);
  };

  it('should render domain filter', () => {
    renderComponent();
    expect(screen.getByTestId('domain-filter')).toBeInTheDocument();
  });

  it('should open and close domain filter dropdown and render domain filter rows when open', () => {
    renderComponent();

    // Initial state
    expect(screen.queryByTestId('domain-filter-row')).not.toBeInTheDocument();

    // Open
    fireEvent.click(screen.getByTestId('domain-filter-expand-button'));
    expect(screen.getAllByTestId('domain-filter-row').length).toEqual(
      domainList.length
    );

    // Close
    fireEvent.click(screen.getByTestId('domain-filter-expand-button'));
    expect(screen.queryByTestId('domain-filter-row')).not.toBeInTheDocument();
  });
});
