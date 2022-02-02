import { VirtualUserInterface } from '../../Core/States/VirtualUserInterface';
import ExitFullScreenCommandIcon from '../../images/Commands/ExitFullScreen.png';
import FullScreenCommandIcon from '../../images/Commands/FullScreen.png';
import { ThreeRenderTargetCommand } from '../Commands/ThreeRenderTargetCommand';
import { ThreeRenderTargetNode } from '../Nodes/ThreeRenderTargetNode';

export class ToggleFullscreenCommand extends ThreeRenderTargetCommand {
  private _isFullScreen = false;

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //= =================================================
  // OVERRIDES of BaseCommand
  //= =================================================

  public /* override */ getName(): string {
    return this._isFullScreen ? 'Exit Full Screen' : 'Full Screen';
  }

  public /* override */ getIcon(): string {
    return this._isFullScreen
      ? ExitFullScreenCommandIcon
      : FullScreenCommandIcon;
  }

  public get /* override */ isCheckable(): boolean {
    return true;
  }

  public get /* override */ isChecked(): boolean {
    return this._isFullScreen;
  }

  protected /* override */ invokeCore(): boolean {
    this._isFullScreen = !this._isFullScreen;
    VirtualUserInterface.setFullScreen(this._isFullScreen);
    if (this.target) this.target.invalidate();
    return true;
  }
}
