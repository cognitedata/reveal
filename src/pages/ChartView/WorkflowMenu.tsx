import React from 'react';
import { Menu } from '@cognite/cogs.js';
import { useUpdateChart } from 'hooks/firebase';
import { Chart, ChartWorkflow } from 'reducers/charts/types';
import {
  updateWorkflow,
  removeWorkflow,
  duplicateWorkflow,
} from 'utils/charts';
import { useLoginStatus } from 'hooks';
import { AppearanceDropdown } from 'components/AppearanceDropdown';

type Props = {
  chart: Chart;
  id: string;
  closeMenu?: () => void;
  startRenaming?: () => void;
};

export default function WorkflowMenu({
  id,
  chart,
  closeMenu,
  startRenaming,
}: Props) {
  const { data: login } = useLoginStatus();
  const { mutate } = useUpdateChart();

  const wf = chart?.workflowCollection?.find((t) => t.id === id);

  if (!login?.user || !wf) {
    return null;
  }

  const update = (diff: Partial<ChartWorkflow>, close: boolean = true) => {
    mutate(updateWorkflow(chart, id, diff));
    if (closeMenu && close) {
      closeMenu();
    }
  };
  const remove = () => mutate(removeWorkflow(chart, id));
  const duplicate = () => mutate(duplicateWorkflow(chart, id));

  return (
    <Menu>
      <Menu.Submenu content={<AppearanceDropdown update={update} />}>
        <span>Appearance</span>
      </Menu.Submenu>
      <Menu.Item
        onClick={() => {
          if (startRenaming) startRenaming();
          if (closeMenu) closeMenu();
        }}
        appendIcon="Edit"
      >
        <span>Rename</span>
      </Menu.Item>
      <Menu.Item onClick={() => duplicate()} appendIcon="Duplicate">
        <span>Duplicate</span>
      </Menu.Item>
      <Menu.Item onClick={() => remove()} appendIcon="Delete">
        <span>Remove</span>
      </Menu.Item>
    </Menu>
  );
}
