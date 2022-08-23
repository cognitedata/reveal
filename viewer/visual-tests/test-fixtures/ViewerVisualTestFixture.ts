/*!
 * Copyright 2022 Cognite AS
 */
import { Cognite3DViewer } from '../../packages/api';
import { VisualTestFixture } from './VisualTestFixture';

export abstract class ViewerVisualTestFixture implements VisualTestFixture {
  private readonly _viewer: Cognite3DViewer;
  constructor() {
    // @ts-expect-error
    this._viewer = new Cognite3DViewer({ _localModels: true });
  }

  public async run(): Promise<void> {
    await this.setup();
    this.render();
  }

  public abstract setup(): Promise<void>;

  public render(): void {}
}
