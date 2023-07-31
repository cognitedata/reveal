import CopyImageIcon from '../../images/Commands/CopyImage.png';
import { ThreeRenderTargetCommand } from '../Commands/ThreeRenderTargetCommand';
import { ThreeRenderTargetNode } from '../Nodes/ThreeRenderTargetNode';

export class CopyImageCommand extends ThreeRenderTargetCommand {
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
    if (this.isFirefox())
      return 'Copy a image of the viewer to the clipboard (Not supported in Firefox)';
    return 'Copy a image of the viewer to the clipboard';
  }

  public /* override */ getIcon(): string {
    return CopyImageIcon;
  }

  protected /* override */ invokeCore(): boolean {
    if (this.isFirefox()) return true;
    this.target?.domElement.toBlob((blob: any) => {
      // @ts-ignore
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    });
    return true;
  }

  private isFirefox(): boolean {
    // @ts-ignore
    return typeof InstallTrigger !== 'undefined';
  }
}
