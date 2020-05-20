import { BaseNode } from "@/Core/Nodes//BaseNode";
import { CheckBoxState } from "@/Core/Enums/CheckBoxState";
import { Target } from "@/Core/Interfaces/Target";

function getCheckBoxImage(node: BaseNode, target: Target | null): void
{
  if (!target)
    target = node.activeTarget;

  const checkBoxState = node.getCheckBoxState(target);
  const hasFocus = false; // This should be true if the mouse hovers over the check box

  if (checkBoxState === CheckBoxState.Never)
  {
    return; // No checkbox
  }
  // let image: Image;
  if (node.isRadio(target))
  {
    if (checkBoxState === CheckBoxState.All || checkBoxState === CheckBoxState.Some)
    {
      // image = RadioOn
    }
    else if (checkBoxState === CheckBoxState.None)
    {
      // image = RadioOff
    }
    else
    {
      Error("Impossible state");
      return;
    }
    if (hasFocus)
    {
      // make image 25% lighter
    }
    return; // image;
  }
  if (node.isFilter(target)) 
  {
    // image = BackgroundFilter.png;
  }
  else
  {
    // image = BackgroundNormal.png;
  }
  if (hasFocus)
  {
    if (node.isFilter(target))
    {
      // Overlay FocusFilter.png
    }
    else
    {
      // Overlay FocusNormal.png
    }
  }
  if (checkBoxState === CheckBoxState.None)
  {
    if (node.canBeChecked(target))
    {
      // Overlay FrameStippled.png on image
    }
    else
    {
      // Overlay Frame.png on image
    }
  }
  else if (checkBoxState === CheckBoxState.Some)
  {
    // Overlay Frame.png on image
    // Overlay CheckedSome.png on image
  }
  else if (checkBoxState === CheckBoxState.All)
  {
    // Overlay Frame.png on image
    // Overlay CheckedAll.png on image
  }
  return; // image;
}


