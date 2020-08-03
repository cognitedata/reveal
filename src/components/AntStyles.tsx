// @ts-nocheck
import { ids } from 'cogs-variables';
import React, { useEffect } from 'react';
import { ConfigProvider, Modal, Tooltip, notification } from 'antd';
import { Tooltip as CogsTooltip } from '@cognite/cogs.js';

import affixStyle from 'antd/es/affix/style/index.less';
import alertStyle from 'antd/es/alert/style/index.less';
// import anchorStyle from 'antd/es/anchor/style/index.less';
// import autoCompleteStyle from 'antd/es/auto-complete/style/index.less';
import avatarStyle from 'antd/es/avatar/style/index.less';
// import backTopStyle from 'antd/es/back-top/style/index.less';
// import badgeStyle from 'antd/es/badge/style/index.less';
import breadcrumbStyle from 'antd/es/breadcrumb/style/index.less';
import buttonStyle from 'antd/es/button/style/index.less';
// import calendarStyle from 'antd/es/calendar/style/index.less';
import cardStyle from 'antd/es/card/style/index.less';
// import carouselStyle from 'antd/es/carousel/style/index.less';
// import cascaderStyle from 'antd/es/cascader/style/index.less';
import checkboxStyle from 'antd/es/checkbox/style/index.less';
import collapseStyle from 'antd/es/collapse/style/index.less';
// import commentStyle from 'antd/es/comment/style/index.less';
import configProviderStyle from 'antd/es/config-provider/style/index.less';
// import datePickerStyle from 'antd/es/date-picker/style/index.less';
// import descriptionsStyle from 'antd/es/descriptions/style/index.less';
// import dividerStyle from 'antd/es/divider/style/index.less';
import drawerStyle from 'antd/es/drawer/style/index.less';
import dropdownStyle from 'antd/es/dropdown/style/index.less';
import emptyStyle from 'antd/es/empty/style/index.less';
import formStyle from 'antd/es/form/style/index.less';
import gridStyle from 'antd/es/grid/style/index.less';
import iconStyle from 'antd/es/icon/style/index.less';
import inputStyle from 'antd/es/input/style/index.less';
// import inputNumberStyle from 'antd/es/input-number/style/index.less';
// import layoutStyle from 'antd/es/layout/style/index.less';
import listStyle from 'antd/es/list/style/index.less';
// import localeStyle from 'antd/es/locale/style/index.less';
// import localeProviderStyle from 'antd/es/locale-provider/style/index.less';
// import mentionStyle from 'antd/es/mention/style/index.less';
// import mentionsStyle from 'antd/es/mentions/style/index.less';
import menuStyle from 'antd/es/menu/style/index.less';
import messageStyle from 'antd/es/message/style/index.less';
import modalStyle from 'antd/es/modal/style/index.less';
import notificationStyle from 'antd/es/notification/style/index.less';
// import pageHeaderStyle from 'antd/es/page-header/style/index.less';
import paginationStyle from 'antd/es/pagination/style/index.less';
// import popconfirmStyle from 'antd/es/popconfirm/style/index.less';
import popoverStyle from 'antd/es/popover/style/index.less';
import progressStyle from 'antd/es/progress/style/index.less';
import radioStyle from 'antd/es/radio/style/index.less';
// import rateStyle from 'antd/es/rate/style/index.less';
import resultStyle from 'antd/es/result/style/index.less';
import selectStyle from 'antd/es/select/style/index.less';
// import skeletonStyle from 'antd/es/skeleton/style/index.less';
// import sliderStyle from 'antd/es/slider/style/index.less';
import spinStyle from 'antd/es/spin/style/index.less';
// import statisticStyle from 'antd/es/statistic/style/index.less';
// import stepsStyle from 'antd/es/steps/style/index.less';
// import styleStyle from 'antd/es/style/index.less/style/index.less';
// import switchStyle from 'antd/es/switch/style/index.less';
import tableStyle from 'antd/es/table/style/index.less';
import tabsStyle from 'antd/es/tabs/style/index.less';
// import tagStyle from 'antd/es/tag/style/index.less';
// import timePickerStyle from 'antd/es/time-picker/style/index.less';
// import timelineStyle from 'antd/es/timeline/style/index.less';
import tooltipStyle from 'antd/es/tooltip/style/index.less';
// import transferStyle from 'antd/es/transfer/style/index.less';
// import treeStyle from 'antd/es/tree/style/index.less';
// import treeSelectStyle from 'antd/es/tree-select/style/index.less';
import typographyStyle from 'antd/es/typography/style/index.less';
import uploadStyle from 'antd/es/upload/style/index.less';
// import versionStyle from 'antd/es/version/style/index.less';

const styles = [
  affixStyle,
  alertStyle,
  avatarStyle,
  breadcrumbStyle,
  buttonStyle,
  cardStyle,
  checkboxStyle,
  collapseStyle,
  configProviderStyle,
  drawerStyle,
  dropdownStyle,
  emptyStyle,
  formStyle,
  gridStyle,
  iconStyle,
  inputStyle,
  listStyle,
  notificationStyle,
  menuStyle,
  messageStyle,
  modalStyle,
  paginationStyle,
  popoverStyle,
  progressStyle,
  radioStyle,
  resultStyle,
  selectStyle,
  spinStyle,
  tableStyle,
  tabsStyle,
  tooltipStyle,
  typographyStyle,
  uploadStyle,
];

Modal.defaultProps = {
  ...Modal.defaultProps,
  getContainer: () => document.getElementsByClassName(ids.styleScope).item(0)!,
};

Tooltip.defaultProps = {
  ...Tooltip.defaultProps,
  getContainer: () => document.getElementsByClassName(ids.styleScope).item(0)!,
};

CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: () => document.getElementsByClassName(ids.styleScope).item(0)!,
};

notification.defaultProps = {
  ...notification.defaultProps,
  getContainer: () => document.getElementsByClassName(ids.styleScope).item(0)!,
};

export default function AntStyles(props: { children: React.Node }) {
  useEffect(() => {
    styles.forEach(style => style.use());
    return () => styles.forEach(style => style.unuse());
  }, []);

  return (
    <ConfigProvider
      getPopupContainer={() =>
        document.getElementsByClassName(ids.styleScope).item(0)!
      }
    >
      <div className="data-exploration-style-scope">{props.children}</div>
    </ConfigProvider>
  );
}
