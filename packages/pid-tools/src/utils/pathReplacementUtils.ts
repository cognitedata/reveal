import { PathReplacement } from '../types';
import { PATH_REPLACEMENT_GROUP, T_JUNCTION } from '../constants';

export const applyPathReplacementInSvg = (
  svg: SVGSVGElement,
  pathReplacement: PathReplacement,
  originalStyle: string
): SVGElement[] => {
  const newPaths: SVGElement[] = [];

  let pathReplacementGroup = svg.getElementById(PATH_REPLACEMENT_GROUP);
  if (!pathReplacementGroup) {
    pathReplacementGroup = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    );
    pathReplacementGroup.id = PATH_REPLACEMENT_GROUP;
    svg.appendChild(pathReplacementGroup);
  }

  const pathToReplace = svg.getElementById(pathReplacement.pathId);
  pathReplacement.replacementPaths.forEach((svgPathWithId) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('style', originalStyle);
    path.id = svgPathWithId.id;

    // Since this is placed under a different group the scaling can be different
    if (path.id.includes(T_JUNCTION)) {
      path.style.strokeWidth = '2';
    } else {
      path.style.strokeWidth = '1';
    }
    path.setAttribute('d', svgPathWithId.svgCommands);
    pathReplacementGroup.appendChild(path);
    newPaths.push(path);
  });

  pathToReplace.parentElement?.removeChild(pathToReplace);

  return newPaths;
};
