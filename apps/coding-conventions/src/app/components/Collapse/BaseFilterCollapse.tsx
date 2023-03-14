import * as React from 'react';

import {
  Collapse,
  Container,
  Panel,
  StyledCollapseIcon,
  StyledTrashIcon,
} from './elements';
import { BaseFilterHeader } from './BaseFilterHeader';
import { colors } from '../../utils/colors';
import { Convention } from '../../types';

// Might need this in the near future. Leaving for now
const CollapseIcon: React.FC<{ isActive?: boolean }> = ({ isActive }) => {
  return (
    <StyledCollapseIcon type="ChevronDown" active={`${isActive}`} /> // note: active is string?!?!
  );
};

const TrashIcon: React.FC<{ isActive?: boolean }> = () => {
  return (
    <StyledTrashIcon type="Delete" /> // note: active is string?!?!
  );
};

interface BaseFilterCollapseProps {
  editMode?: boolean;
  children: React.ReactNode;
  activeKeys: string[];
  onChange: (items: string[]) => void;
  onIconClick: () => void;
}
export const BaseFilterCollapse = ({
  editMode,
  children,
  activeKeys,
  onIconClick,
  onChange,
  ...rest
}: BaseFilterCollapseProps) => {
  const Icon = editMode ? TrashIcon : CollapseIcon;

  return (
    <Collapse
      {...rest}
      activeKey={activeKeys}
      // Might be we will support collapse in the near future! Leaving this here.
      onChange={(keys) => {
        if (!editMode) {
          onChange(keys as unknown as string[]);
        }
      }}
      ghost
      expandIcon={(props) => {
        return (
          <i style={{ height: '16px' }} onClick={onIconClick}>
            <Icon {...props} aria-label="Icon" />
          </i>
        );
      }}
    >
      {children}
    </Collapse>
  );
};

export interface BaseFilterPanelProps {
  children: React.ReactNode;
  editMode?: boolean;
  conventions: Convention[];
  convention: Convention;
  onChange: (convention: Convention) => void;
  onResetClick?: () => void;
}
export const BaseFilterPanel = ({
  children,
  editMode,
  conventions,
  convention,
  onChange,
  ...rest
}: BaseFilterPanelProps) => {
  return (
    <Panel
      {...rest}
      header={
        <Container>
          <BaseFilterHeader
            onChange={onChange}
            conventions={conventions}
            convention={convention}
            editMode={editMode}
          />
        </Container>
      }
      $color={colors[convention.start]}
    >
      {children}
    </Panel>
  );
};

BaseFilterCollapse.Panel = BaseFilterPanel;
