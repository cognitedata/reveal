// Explorer Interfaces

import { ReactText } from "react";

export interface TreeDataItem {
  id: ReactText;
  name: ReactText;
  expanded: boolean;
  children: TreeDataItem[];
  icon: string;
  iconDescription: string;
  selected: boolean;
  checked: boolean;
  indeterminate: boolean;
  isRadio: boolean;
  isFilter: boolean;
  disabled: boolean;
  visible: boolean;
}
