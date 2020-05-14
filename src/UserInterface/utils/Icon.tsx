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
      }
    case IconTypes.NODES:
      switch (iconName)
      {
        case "PolylinesNode":
          return require("../resources/Icons/Nodes/PolylinesNode.png")
      }
    case IconTypes.ARROWS:
      switch (iconName)
      {
        case "FatRight":
          return require("../resources/Icons/Arrows/FatRight.png");
        case "FatLeft":
          return require("../resources/Icons/Arrows/FatLeft.png");
      }
  }
  return require("../resources/Icons/Actions/Close.png");
};