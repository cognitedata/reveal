import * as Color from "color";
import { Colors } from "@/Core/Primitives/Colors";

export class Appearance
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  // Tree control
  static treeIndentation = 20; // Controls tree indentation in pixels

  static treeItemGap = 2; // Controls item vertical gap

  static treeIconSize = 20; // Tree icons size in pixel

  static treeFontSize = 16; // Realative or absolute? Do what best

  static treeBackgroundColor?: Color = undefined; // Use brush instead here?

  // Toolbar
  static toolbarIconSize = 24; // Toolbar icon size  in pixel

  static toolbarCommandsPerLine = 19; // Commands per line in toolbar

  // Panel sizes
  static leftPanelDefaultSize = 290; //Default size of left panel

  static leftPanelMaxSize = 1000; //Maximum size of left panel

  // For the viewer
  static viewerFooter = "Cognite subsurface viewer";

  static viewerIsLightBackground = false; // True is white, False is black

  static viewerSmallestCameraDeltaAngle = Math.PI / 100;

  static viewerFontType = "sans-serif"; // "Helvetica" Use brush instead here?

  static viewerOverlayFontSize = 15;

  static viewerFooterFontSize = 16;

  static viewerOverlayFgColor: Color = Colors.black;

  static viewerOverlayBgColor: Color = Colors.white.alpha(0.65);
}