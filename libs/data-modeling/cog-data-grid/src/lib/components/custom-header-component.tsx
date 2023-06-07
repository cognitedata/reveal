import React, { PureComponent } from 'react';

import { IHeaderParams } from 'ag-grid-community';

import { Button, Icon, IconType } from '@cognite/cogs.js';

interface CustomHeaderState {
  sortDirection: string;
  sortable: boolean;
  enableMenu: boolean;
  showFilterIcon: boolean;
}
export interface CustomHeaderProps extends IHeaderParams {
  headerIcon: IconType;
}

/**
 * Custom header component following Figma Design guidelines
 */
export class CustomHeader extends PureComponent<
  CustomHeaderProps,
  CustomHeaderState
> {
  private menuButton: any;
  constructor(props: CustomHeaderProps) {
    super(props);
    this.state = {
      sortDirection: '',
      sortable: props.enableSorting!,
      enableMenu: props.enableMenu === true,
      showFilterIcon: this.props.column.isFilterActive(),
    };

    this.onSortRequested = this.onSortRequested.bind(this);
    this.onSortChanged = this.onSortChanged.bind(this);
    this.getSortDirection = this.getSortDirection.bind(this);
    this.onMenuClicked = this.onMenuClicked.bind(this);
    this.onFilterChanged = this.onFilterChanged.bind(this);
  }

  componentDidMount() {
    this.onSortChanged();
    this.props.column.addEventListener('sortChanged', this.onSortChanged);
    this.props.column.addEventListener('filterChanged', this.onFilterChanged);
  }

  componentWillUnmount() {
    this.props.column.removeEventListener('sortChanged', this.onSortChanged);
    this.props.column.removeEventListener(
      'filterChanged',
      this.onFilterChanged
    );
  }

  render() {
    const sortIndex = this.props.column.getSortIndex();
    return (
      <div className="ag-cell-label-container ag-header-cell-sorted-none">
        {this.state.enableMenu && (
          <span
            data-ref="eMenu"
            ref={(menuButton) => {
              this.menuButton = menuButton;
            }}
            onClick={this.onMenuClicked}
            className="ag-header-icon ag-header-cell-menu-button "
            aria-hidden="true"
          >
            <Button
              aria-label="Filter"
              size="small"
              className="menu-button"
              icon="EllipsisVertical"
            />

            <Button
              aria-label="Filter"
              icon="Filter"
              size="small"
              className="filter-button"
            />
          </span>
        )}

        <span
          data-ref="eSortOrder"
          className={
            'ag-header-icon ag-header-label-icon ag-sort-order ' +
            (sortIndex ? '' : 'ag-hidden')
          }
        >
          {sortIndex ? sortIndex + 1 : ''}
        </span>
        <span
          data-ref="eSortAsc"
          className={
            'ag-header-icon ag-header-label-icon ag-sort-ascending-icon ' +
            (this.state.sortDirection === 'asc' ? '' : 'ag-hidden')
          }
        >
          <Button size="small" type="ghost" onClick={this.onSortRequested}>
            <Icon type="SortAscending" />
          </Button>
        </span>
        <span
          data-ref="eSortDesc"
          className={
            'ag-header-icon ag-header-label-icon ag-sort-descending-icon ' +
            (this.state.sortDirection === 'desc' ? '' : 'ag-hidden')
          }
        >
          <Button size="small" type="ghost" onClick={this.onSortRequested}>
            <Icon type="SortDescending" />
          </Button>
        </span>

        <div
          data-ref="eLabel"
          className="ag-header-cell-label"
          onClick={this.onSortRequested}
        >
          {this.props.headerIcon && (
            <span className="ag-header-icon cog-column-type-icon">
              <Icon type={this.props.headerIcon} />
            </span>
          )}
          <span data-ref="eText" className="ag-header-cell-text">
            {this.props.displayName}
          </span>
        </div>
      </div>
    );
  }

  onMenuClicked() {
    this.props.showColumnMenu(this.menuButton);
    this.props.column.setMenuVisible(true);
  }

  onSortChanged() {
    this.setState({
      sortDirection: this.props.column.getSort() || '',
    });
  }

  onFilterChanged() {
    this.setState({
      showFilterIcon: this.props.column.isFilterActive(),
    });
  }

  onSortRequested(event: any) {
    if (!this.state.sortable) {
      return;
    }
    this.props.setSort(
      this.getSortDirection() as any,
      event.shiftKey || event.ctrlKey || event.metaKey
    );
  }

  private getSortDirection() {
    let direction = '';
    if (this.props.column.isSortAscending()) {
      direction = 'desc';
    } else if (this.props.column.isSortDescending()) {
      direction = '';
    } else {
      direction = 'asc';
    }
    return direction;
  }
}
