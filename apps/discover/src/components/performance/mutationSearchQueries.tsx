export const measurementsPageLoadQuery = {
  type: 'childList',
  searchIn: ['addedNodes', 'removedNodes'],
  searchFor: 'attribute',
  searchBy: 'class',
  searchValue: 'js-plotly-plot',
};

export const nptGraphPageLoadQuery = {
  type: 'childList',
  searchIn: ['addedNodes', 'removedNodes'],
  searchFor: 'attribute',
  searchBy: 'data-testid',
  searchValue: 'chart-title',
};

export const searchVisibleQuery = {
  type: 'childList',
  searchIn: ['addedNodes', 'removedNodes'],
  searchFor: 'attribute',
  searchBy: 'data-testid',
  searchValue: 'main-search-input',
};

export const trajectoryPageLoadQuery = {
  type: 'childList',
  searchIn: ['addedNodes', 'removedNodes'],
  searchFor: 'attribute',
  searchBy: 'class',
  searchValue: 'js-plotly-plot',
};

export const documentResultTableLoadQuery = {
  type: 'childList',
  searchIn: ['addedNodes', 'removedNodes'],
  searchFor: 'attribute',
  searchBy: 'data-testid',
  searchValue: 'table-row',
};
