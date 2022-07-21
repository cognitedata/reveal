import React, { PureComponent } from 'react';
import { IHeaderParams } from 'ag-grid-community';
import { Icon, IconType } from '@cognite/cogs.js';

interface CustomHeaderState {
  sortDirection: string;
  sortable: boolean;
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
      sortable: props.enableSorting,
    };

    this.onSortRequested = this.onSortRequested.bind(this);
    this.onSortChanged = this.onSortChanged.bind(this);
    this.getSortDirection = this.getSortDirection.bind(this);
    this.onMenuClicked = this.onMenuClicked.bind(this);
  }

  componentDidMount() {
    this.onSortChanged();
    this.props.column.addEventListener('sortChanged', this.onSortChanged);
  }

  componentWillUnmount() {
    this.props.column.removeEventListener('sortChanged', this.onSortChanged);
  }

  render() {
    const sortIndex = this.props.column.getSortIndex();
    return (
      <div className="ag-cell-label-container ag-header-cell-sorted-none">
        {this.props.enableMenu && (
          <span
            data-ref="eMenu"
            ref={(menuButton) => {
              this.menuButton = menuButton;
            }}
            onClick={this.onMenuClicked}
            className="ag-header-icon ag-header-cell-menu-button ag-header-menu-always-show"
          >
            <Icon type="HamburgerMenu" />
          </span>
        )}

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
          <span
            data-ref="eFilter"
            className="ag-header-icon ag-header-label-icon ag-filter-icon ag-hidden"
          ></span>
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
            <Icon type="ReorderAscending" />
          </span>
          <span
            data-ref="eSortDesc"
            className={
              'ag-header-icon ag-header-label-icon ag-sort-descending-icon ' +
              (this.state.sortDirection === 'desc' ? '' : 'ag-hidden')
            }
          >
            <Icon type="ReorderDescending" />
          </span>
        </div>
      </div>
    );
  }

  onMenuClicked() {
    this.props.showColumnMenu(this.menuButton);
  }

  onSortChanged() {
    this.setState({
      sortDirection: this.props.column.getSort() || '',
    });
  }

  onSortRequested(event: any) {
    if (!this.state.sortable) {
      return;
    }
    this.props.setSort(
      this.getSortDirection(),
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
