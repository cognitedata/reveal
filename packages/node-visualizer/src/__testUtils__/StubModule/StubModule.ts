//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import { BaseModule } from 'Core/Module/BaseModule';
import { ViewFactory } from 'Core/Views/ViewFactory';
import { PolylinesNode } from 'SubSurface/Basics/PolylinesNode';
import { BaseRootNode } from 'Core/Nodes/BaseRootNode';
import { SubSurfaceRootNode } from 'SubSurface/Trees/SubSurfaceRootNode';

import { StubPolylinesView } from '__testUtils__/StubModule/StubPolylinesView';
import { StubTargetNode } from '__testUtils__/StubModule/StubTargetNode';

export class StubModule extends BaseModule {
  //= =================================================
  // OVERRIDES of BaseModule
  //= =================================================

  public /* override */ registerViews(factory: ViewFactory): void {
    factory.register(
      PolylinesNode.className,
      StubPolylinesView,
      StubTargetNode.className
    );
  }

  public /* override */ createRoot(): BaseRootNode {
    return new SubSurfaceRootNode();
  }
}
