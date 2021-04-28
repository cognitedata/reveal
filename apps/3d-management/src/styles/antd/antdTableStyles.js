// import buttonStyle from 'antd/es/button/style/index.less';
// import checkboxStyle from 'antd/es/checkbox/style/index.less';
import dropdownStyle from 'antd/es/dropdown/style/index.less';
import paginationStyle from 'antd/es/pagination/style/index.less';
import selectStyle from 'antd/es/select/style/index.less';
import tableStyle from 'antd/es/table/style/index.less';

import { Table } from 'antd';

Table.defaultProps = {
  ...Table.defaultProps,
  showSorterTooltip: false,
};

export default [
  // commented out are also used by antd Table (filters),
  // but declared in antdGlobalStyles so commented out here

  // buttonStyle,
  // checkboxStyle,
  dropdownStyle,
  paginationStyle,
  selectStyle,
  tableStyle,
];
