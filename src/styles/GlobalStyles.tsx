// @ts-nocheck
import React from 'react';
import { getContainer } from 'utils/utils';
import { styleScope } from './styleScope';
import { Icon, Loader, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import tabsStyle from 'antd/es/tabs/style/index.less';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import {
  ConfigProvider,
  Modal,
  Tooltip,
  notification,
  Dropdown,
  Spin,
} from 'antd';
import alertStyle from 'antd/es/alert/style/index.less';
import autoCompleteStyle from 'antd/es/auto-complete/style/index.less';
import badgeStyle from 'antd/es/badge/style/index.less';
import buttonStyle from 'antd/es/button/style/index.less';
import checkboxStyle from 'antd/es/checkbox/style/index.less';
import coreStyle from 'antd/es/style/core/index.less';
import drawerStyle from 'antd/es/drawer/style/index.less';
import dropdownStyle from 'antd/es/dropdown/style/index.less';
import formStyle from 'antd/es/form/style/index.less';
import gridStyle from 'antd/es/grid/style/index.less';
import inputNumberStyle from 'antd/es/input-number/style/index.less';
import inputStyle from 'antd/es/input/style/index.less';
import listStyle from 'antd/es/list/style/index.less';
import menuStyle from 'antd/es/menu/style/index.less';
import modalStyle from 'antd/es/modal/style/index.less';
import notificationStyle from 'antd/es/notification/style/index.less';
import paginationStyle from 'antd/es/pagination/style/index.less';
import popoverStyle from 'antd/es/popover/style/index.less';
import radioStyle from 'antd/es/radio/style/index.less';
import selectStyle from 'antd/es/select/style/index.less';
import tableStyle from 'antd/es/table/style/index.less';
import tagStyle from 'antd/es/tag/style/index.less';
import tooltipStyle from 'antd/es/tooltip/style/index.less';
import treeSelectStyle from 'antd/es/tree-select/style/index.less';
import treeStyle from 'antd/es/tree/style/index.less';
import typographyStyle from 'antd/es/typography/style/index.less';

const antdStyles = [
  alertStyle,
  autoCompleteStyle,
  badgeStyle,
  buttonStyle,
  checkboxStyle,
  coreStyle,
  drawerStyle,
  dropdownStyle,
  formStyle,
  gridStyle,
  inputNumberStyle,
  inputStyle,
  listStyle,
  menuStyle,
  modalStyle,
  notificationStyle,
  paginationStyle,
  popoverStyle,
  radioStyle,
  selectStyle,
  tableStyle,
  tagStyle,
  tooltipStyle,
  treeSelectStyle,
  treeStyle,
  typographyStyle,
];

// This will override the appendTo prop on all Tooltips used from cogs
CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

Modal.defaultProps = {
  ...Modal.defaultProps,
  getContainer,
};

Tooltip.defaultProps = {
  ...Tooltip.defaultProps,
  getContainer,
};

CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

notification.config({
  getContainer,
});

Dropdown.defaultProp = {
  ...Dropdown.defaultProps,
  getPopupContainer: getContainer,
};

Spin.setDefaultIndicator(<Icon type="Loader" />);

export default function GlobalStyles(props: { children: React.ReactNode }) {
  const isInjectedStyles = useGlobalStyles([
    ...antdStyles,
    cogsStyles,
    tabsStyle,
  ]);

  if (!isInjectedStyles) {
    return <Loader />;
  }

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
