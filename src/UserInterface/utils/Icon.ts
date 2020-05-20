import { IconTypes } from "../constants/Icons";

import Close from "../../../images/Arrows/FatLeft.png";
import Clean from "../../../images/Actions/Clean.png";
import Reset from "../../../images/Actions/Reset.png";
import Solution from "../../../images/Actions/Solution.png";
import Copy from "../../../images/Actions/Copy.png";
import Paste from "../../../images/Actions/Paste.png";
import FontBold from "../../../images/Actions/FontBold.png";
import FontItalic from "../../../images/Actions/FontItalic.png";
import FontUnderline from "../../../images/Actions/FontUnderline.png";
import Pinned from "../../../images/States/Pinned.png";
import PolylinesNode from "../../../images/Nodes/PolylinesNode.png";
import PointCloudNode from "../../../images/Nodes/PointCloudNode.png";
import FolderNode from "../../../images/Nodes/FolderNode.png";
import MapIcon from "../../../images/Nodes/Map.png";
import PointsNode from "../../../images/Nodes/PointsNode.png";
import FatRight from "../../../images/Arrows/FatRight.png";
import FatLeft from "../../../images/Arrows/FatLeft.png";
import Cube from "../../../images/PointSymbol/Cube.png";
import Sphere from "../../../images/PointSymbol/Sphere.png";
import LabelImage from "../../../images/Show/Label.png";
import WellNode from "../../../images/Nodes/WellNode.png";

export default function getIcon(iconType: string, iconName: string) {
  switch (iconType) {
    case IconTypes.ACTIONS:
      switch (iconName) {
        case "Close":
          return Close;
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
    case IconTypes.STATES:
      switch (iconName) {
        case "Pinned":
          return Pinned;
      }
    case IconTypes.NODES:
      switch (iconName) {
        case "PolylinesNode":
          return PolylinesNode;
        case "PointCloudNode":
          return PointCloudNode;
        case "FolderNode":
          return FolderNode;
        case "MapIcon":
          return MapIcon;
        case "PointsNode":
          return PointsNode;
        case "WellNode":
          return WellNode;
      }
    case IconTypes.ARROWS:
      switch (iconName) {
        case "FatRight":
          return FatRight;
        case "FatLeft":
          return FatLeft;
      }
    case IconTypes.POINT_SYMBOL:
      switch (iconName) {
        case "Cube":
          return Cube;
        case "Sphere":
          return Sphere;
      }
    case IconTypes.SHOW:
      switch (iconName) {
        case "Label":
          return LabelImage;
      }
  }
  return undefined;
}
