import {
  IconTypes
} from "../constants/Icons";

import Close from "../assets/images/Icons/Actions/Close.png";
import Clean from "../assets/images/Icons/Actions/Clean.png";
import Reset from "../assets/images/Icons/Actions/Reset.png";
import Solution from "../assets/images/Icons/Actions/Solution.png";
import Copy from "../assets/images/Icons/Actions/Copy.png";
import Paste from "../assets/images/Icons/Actions/Paste.png";
import FontBold from "../assets/images/Icons/Actions/FontBold.png";
import FontItalic from "../assets/images/Icons/Actions/FontItalic.png";
import FontUnderline from "../assets/images/Icons/Actions/FontUnderline.png";
import Pinned from "../assets/images/Icons/States/Pinned.png";
import PolylinesNode from "../assets/images/Icons/Nodes/PolylinesNode.png";
import PointCloudNode from "../assets/images/Icons/Nodes/PointCloudNode.png";
import FolderNode from "../assets/images/Icons/Nodes/FolderNode.png";
import MapIcon from "../assets/images/Icons/Nodes/Map.png";
import PointsNode from "../assets/images/Icons/Nodes/PointsNode.png";
import FatRight from "../assets/images/Icons/Arrows/FatRight.png";
import FatLeft from "../assets/images/Icons/Arrows/FatLeft.png";
import Cube from "../assets/images/Icons/PointSymbol/Cube.png";
import Sphere from "../assets/images/Icons/PointSymbol/Sphere.png";
import LabelImage from "../assets/images/Icons/Show/Label.png";
import WellNode from "../assets/images/Icons/Nodes/WellNode.png";


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
          return Pinned
      }
    case IconTypes.NODES:
      switch (iconName) {
        case "PolylinesNode":
          return PolylinesNode;
        case "PointCloudNode":
          return PointCloudNode;
        case "FolderNode":
          return FolderNode;
        case "Map":
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
};
