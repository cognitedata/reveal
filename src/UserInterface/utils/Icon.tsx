import
{
  IconTypes
} from "../constants/Icons";

export default function getIcon(iconType: string, iconName: string)
{
  switch (iconType)
  {
    case IconTypes.ACTIONS:
      switch (iconName)
      {
        case "Close":
          return require("../resources/Icons/Actions/Close.png");
        case "Clean":
          return require("../resources/Icons/Actions/Clean.png");
        case "Reset":
          return require("../resources/Icons/Actions/Reset.png");
        case "Solution":
          return require("../resources/Icons/Actions/Solution.png");
        case "Copy":
          return require("../resources/Icons/Actions/Copy.png");
        case "Paste":
          return require("../resources/Icons/Actions/Paste.png");
        case "FontBold":
          return require("../resources/Icons/Actions/FontBold.png");
        case "FontItalic":
          return require("../resources/Icons/Actions/FontItalic.png");
        case "FontUnderline":
          return require("../resources/Icons/Actions/FontUnderline.png");
      }
    case IconTypes.STATES:
      switch (iconName)
      {
        case "Pinned":
          return require("../resources/Icons/States/Pinned.png")
      }
    case IconTypes.NODES:
      switch (iconName)
      {
        case "PolylinesNode":
          return require("../resources/Icons/Nodes/PolylinesNode.png")
        case "PointCloudNode":
          return require("../resources/Icons/Nodes/PointCloudNode.png");
        case "FolderNode":
          return require("../resources/Icons/Nodes/FolderNode.png");
        case "Map":
          return require("../resources/Icons/Nodes/Map.png");
        case "PointsNode":
          return require("../resources/Icons/Nodes/PointsNode.png");
      }
    case IconTypes.ARROWS:
      switch (iconName)
      {
        case "FatRight":
          return require("../resources/Icons/Arrows/FatRight.png");
        case "FatLeft":
          return require("../resources/Icons/Arrows/FatLeft.png");
      }
    case IconTypes.POINT_SYMBOL:
      switch (iconName)
      {
        case "Cube":
          return require("../resources/Icons/PointSymbol/Sphere.png");
        case "Sphere":
          return require("../resources/Icons/PointSymbol/Cube.png");
      }
    case IconTypes.SHOW:
      switch (iconName)
      {
        case "Label":
          return require("../resources/Icons/Show/Label.png");
      }
  }
  return require("../resources/Icons/Actions/Close.png");
};