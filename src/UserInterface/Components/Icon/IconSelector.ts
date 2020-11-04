import Clean from "@images/Actions/Clean.png";
import Reset from "@images/Actions/Reset.png";
import Solution from "@images/Actions/Solution.png";
import Copy from "@images/Actions/Copy.png";
import Paste from "@images/Actions/Paste.png";
import FontBold from "@images/Actions/FontBold.png";
import FontItalic from "@images/Actions/FontItalic.png";
import FontUnderline from "@images/Actions/FontUnderline.png";
import Pinned from "@images/States/Pinned.png";
import FolderNode from "@images/Nodes/FolderNode.png";
import MapIcon from "@images/Nodes/Map.png";
import FatRight from "@images/Arrows/FatRight.png";
import FatLeft from "@images/Arrows/FatLeft.png";
import Cube from "@images/PointSymbol/Cube.png";
import Sphere from "@images/PointSymbol/Sphere.png";
import LabelImage from "@images/Show/Label.png";

import { IconTypes } from "@/UserInterface/Components/Icon/IconTypes";

export function getIcon(iconType: IconTypes, iconName: string) {
  switch (iconType) {
    case IconTypes.Actions:
      switch (iconName) {
        case "Close":
          return FatLeft;
        case "Clean":
          return Clean;
        case "Reset":
          return Reset;
        case "Solution":
          return Solution;
        case "Copy":
          return Copy;
        case "Paste":
          return Paste;
        case "FontBold":
          return FontBold;
        case "FontItalic":
          return FontItalic;
        case "FontUnderline":
          return FontUnderline;
      }
      break;
    case IconTypes.States:
      switch (iconName) {
        case "Pinned":
          return Pinned;
      }
      break;
    case IconTypes.Nodes:
      switch (iconName) {
        case "FolderNode":
          return FolderNode;
        case "MapIcon":
          return MapIcon;
      }
      break;
    case IconTypes.Arrows:
      switch (iconName) {
        case "FatRight":
          return FatRight;
        case "FatLeft":
          return FatLeft;
      }
      break;
    case IconTypes.PointSymbol:
      switch (iconName) {
        case "Cube":
          return Cube;
        case "Sphere":
          return Sphere;
      }
      break;
    case IconTypes.Show:
      switch (iconName) {
        case "Label":
          return LabelImage;
      }
      break;
  }
  return undefined;
}
