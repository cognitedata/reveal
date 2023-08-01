import { AddResourceOptions, AddReveal3DModelOptions } from "../../src";

export function is3DModelOption(threeDResource: AddResourceOptions): threeDResource is AddReveal3DModelOptions {
    return (threeDResource as AddReveal3DModelOptions).modelId !== undefined && (threeDResource as AddReveal3DModelOptions).revisionId !== undefined;
  }