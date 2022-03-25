import React from 'react';
import { styleScope } from 'utils/styleScope';
import { getContainer } from 'utils/utils';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import { Icon, Loader } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import {
  ConfigProvider,
  Modal,
  Tooltip,
  notification,
  Dropdown,
  Spin,
} from 'antd';
import affixStyle from 'antd/es/affix/style/index.less';
import alertStyle from 'antd/es/alert/style/index.less';
import breadcrumbStyle from 'antd/es/breadcrumb/style/index.less';
import buttonStyle from 'antd/es/button/style/index.less';
import cardStyle from 'antd/es/card/style/index.less';
import carouselStyle from 'antd/es/carousel/style/index.less';
import coreStyle from 'antd/es/style/core/index.less';
import drawerStyle from 'antd/es/drawer/style/index.less';
import gridStyle from 'antd/es/grid/style/index.less';
import inputNumberStyle from 'antd/es/input-number/style/index.less';
import inputStyle from 'antd/es/input/style/index.less';
import layoutStyle from 'antd/es/layout/style/index.less';
import menuStyle from 'antd/es/menu/style/index.less';
import messageStyle from 'antd/es/message/style/index.less';
import modalStyle from 'antd/es/modal/style/index.less';
import notificationStyle from 'antd/es/notification/style/index.less';
import paginationStyle from 'antd/es/pagination/style/index.less';
import popconfirmStyle from 'antd/es/popconfirm/style/index.less';
import popoverStyle from 'antd/es/popover/style/index.less';
import progressStyle from 'antd/es/progress/style/index.less';
import selectStyle from 'antd/es/select/style/index.less';
import spinStyle from 'antd/es/spin/style/index.less';
import tableStyle from 'antd/es/table/style/index.less';
import tagStyle from 'antd/es/tag/style/index.less';
import tooltipStyle from 'antd/es/tooltip/style/index.less';
import uploadStyle from 'antd/es/upload/style/index.less';

const antdStyles = [
  affixStyle,
  alertStyle,
  breadcrumbStyle,
  buttonStyle,
  cardStyle,
  carouselStyle,
  coreStyle,
  drawerStyle,
  gridStyle,
  inputNumberStyle,
  inputStyle,
  layoutStyle,
  menuStyle,
  messageStyle,
  modalStyle,
  notificationStyle,
  paginationStyle,
  popconfirmStyle,
  popoverStyle,
  progressStyle,
  selectStyle,
  spinStyle,
  tableStyle,
  tagStyle,
  tooltipStyle,
  uploadStyle,
];

Modal.defaultProps = {
  ...Modal.defaultProps,
  getContainer,
  bodyStyle: {
    padding: '20px',
    borderRadius: '10px',
  },
};

Tooltip.defaultProps = {
  ...Tooltip.defaultProps,
  getPopupContainer: getContainer,
};

notification.config({
  getContainer,
});

Dropdown.defaultProps = {
  ...Dropdown.defaultProps,
  getPopupContainer: getContainer,
};

Spin.setDefaultIndicator(<Icon type="Loader" />);

export function GlobalStyles(props: { children: React.ReactNode }) {
  const isInjectedStyles = useGlobalStyles([...antdStyles, cogsStyles]);

  if (!isInjectedStyles) {
    return <Loader />;
  }

  return (
    <ConfigProvider getPopupContainer={getContainer}>
      <div className={styleScope}>{props.children}</div>
    </ConfigProvider>
  );
}
