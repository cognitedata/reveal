/*!
 * Copyright 2025 Cognite AS
 */

import { type Class } from '../../domainObjectsHelpers/Class';
import { type BaseCommand } from '../BaseCommand';
import { type BaseTool } from '../BaseTool';

export type Toolbar = Array<BaseCommand | undefined>;

/**
 * Determines if a toolbar can be created for the given tool.
 *
 * @param tool - The tool to check.
 * @returns `true` if a toolbar can be created, otherwise `false`.
 */
export function hasToolbar(tool: BaseTool): boolean {
  const toolType = getClassOf(tool);
  return _toolbar.has(toolType);
}

/**
 * Creates a toolbar for the given tool.
 *
 * @param tool - The tool which the toolbar is to be created.
 * @returns A toolbar if creation is successful, otherwise undefined.
 */
export function getToolbar(tool: BaseTool): Toolbar | undefined {
  const toolType = getClassOf(tool);
  return _toolbar.get(toolType);
}

/**
 * Installs a toolbar creator for a given tool.
 *
 * @param toolType - The class of the tool for which the toolbar creator is being installed.
 * @param creator - The toolbar creator to be installed.
 */
export function installToolbar(toolType: Class<BaseTool>, toolbar: Toolbar): void {
  _toolbar.set(toolType, toolbar);
}

const _toolbar = new Map<Class<BaseTool>, Toolbar>();

function getClassOf(tool: BaseTool): Class<BaseTool> {
  return tool.constructor as Class<BaseTool>;
}
