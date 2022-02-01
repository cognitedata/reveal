import { PathReplacement } from '../types';
import { PATH_REPLACEMENT_GROUP } from '../constants';

export const applyPathReplacementInSvg = (
  svg: SVGSVGElement,
  pathReplacement: PathReplacement
) => {
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
    path.setAttribute('style', pathToReplace.getAttribute('style') as string);
    path.style.strokeWidth = '1'; // Since this is placed under a different group the scaling can be different
    path.id = svgPathWithId.id;
    path.setAttribute('d', svgPathWithId.svgCommands);
    pathReplacementGroup.appendChild(path);
  });

  pathToReplace.parentElement?.removeChild(pathToReplace);
};
