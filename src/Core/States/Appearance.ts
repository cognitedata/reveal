
import * as Color from "color"

export class Appearance
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static treeIndentation = 20; // Controls tree indentation in pixels
  static treeIconSize = 20;  // Tree icons size in pixel
  static toolbarIconSize = 24; // Toolbar icon size  in pixel
  static toolbarCommandsPerLine = 18; // Commands per line in toolbar
  static treeFontSize = 10; // Realative or absolute? Do what best
  static treeBackgoundColor: Color = new Color(); // Use brush instead here?
  static fontIn3D = "Helvetica"; // Use brush instead here?

  static maxCameraDifferenceAngle = Math.PI / 100

}