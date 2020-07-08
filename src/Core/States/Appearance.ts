
import * as Color from "color"

export class Appearance
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static treeIndentation = 20; // Controls tree indentation in pixels
  static treeItemGap = 2; // Controls item vertical gap
  static treeIconSize = 20;  // Tree icons size in pixel
  static toolbarIconSize = 24; // Toolbar icon size  in pixel
  static toolbarCommandsPerLine = 18; // Commands per line in toolbar
  static treeFontSize = 16; // Realative or absolute? Do what best
  static treeBackgroundColor?: Color = undefined; // Use brush instead here?
  static fontIn3D = "Helvetica"; // Use brush instead here?
  static leftPanelDefaultSize = 290; //Default size of left panel
  static leftPanelMaxSize = 1000; //Maximum size of left panel

  static maxCameraDifferenceAngle = Math.PI / 100

}