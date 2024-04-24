/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useEffect } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { Button, Tooltip as CogsTooltip, type IconType } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseTool } from '../../architecture/commands/BaseTool';
import { type RevealRenderTarget } from '../../architecture/RenderTarget/RevealRenderTarget';

type CreateToolDelegate = (renderTarget: RevealRenderTarget) => BaseTool;

export const BaseToolButton = (createToolDelegate: CreateToolDelegate): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const [tool] = useState<BaseTool>(createTool());

  function createTool(): BaseTool {
    const newTool = createToolDelegate(renderTarget);
    const oldTool = renderTarget.toolController.getByEqualName(newTool);
    return oldTool ?? newTool;
  }

  // These are redundant, but react fore me to add these to update
  const [isChecked, setChecked] = useState<boolean>(true);
  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isVisible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    function update(): void {
      setChecked(tool.isChecked);
      setEnabled(tool.isEnabled);
      setVisible(tool.isVisible);
    }

    const toolController = renderTarget.toolController;
    if (!toolController.exists(tool)) {
      toolController.add(tool);
      update();
    }
    tool.addEventListener(update);
    return () => {
      tool.removeEventListener(update);
    };
  }, [tool]);

  if (!isVisible) {
    return <></>;
  }

  const toolTip = t(tool.tooltipKey, tool.tooltip);
  return (
    <CogsTooltip content={toolTip} placement="right" appendTo={document.body}>
      <Button
        type="ghost"
        icon={tool.icon as IconType}
        toggled={isChecked}
        disabled={!isEnabled}
        aria-label={tool.name}
        onClick={() => {
          tool.invoke();
        }}
      />
    </CogsTooltip>
  );
};
