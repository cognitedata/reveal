import * as Color from "color";

export interface ITreeNode
{
  uniqueId: string;
  parentId?: string | null;
  name: string;
  expanded?: boolean;
  type?: string;
  icon?: {
    path: string;
    description?: string;
    color?: Color;
  };
  selected?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
  isRadio?: boolean;
  isFilter?: boolean;
  disabled?: boolean;
  checkVisible?: boolean;
  visible?: boolean;
  label: {
    italic: boolean;
    bold: boolean;
    color: Color;
  };
  children: ITreeNode[];
}
