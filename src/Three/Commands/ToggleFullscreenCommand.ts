import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ThreeRenderTargetCommand } from "@/Three/Commands/ThreeRenderTargetCommand";
import FullScreenCommandIcon from "@images/Commands/FullScreen.png";
import ExitFullScreenCommandIcon from "@images/Commands/ExitFullScreen.png";
import { VirtualUserInterface } from "@/Core/States/VirtualUserInterface";


export class ToggleFullscreenCommand extends ThreeRenderTargetCommand 
{

    private _isFullScreen = false;

    //==================================================
    // CONSTRUCTORS
    //==================================================

    public constructor(target: ThreeRenderTargetNode | null = null) 
    {
        super(target);
    }

    //==================================================
    // OVERRIDES of BaseCommand
    //==================================================

    public /*override*/ getName(): string { return this._isFullScreen ? "Exit Full Screen" : "Full Screen" }
    public /*override*/ getIcon(): string { return this._isFullScreen ? ExitFullScreenCommandIcon : FullScreenCommandIcon }
    public /*override*/ get isCheckable(): boolean { return true; }
    public /*override*/ get isChecked(): boolean { return this._isFullScreen; }

    protected /*override*/ invokeCore(): boolean 
    {
        this._isFullScreen = !this._isFullScreen;
        VirtualUserInterface.setFullScreen(this._isFullScreen);
        if (this.target)
            this.target.invalidate();
        return true;
    }
}
