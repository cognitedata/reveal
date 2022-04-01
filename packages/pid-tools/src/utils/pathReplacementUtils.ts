import { PathReplacement, PathReplacementGroup } from '../types';
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

export const getPathReplacementDescendants = (
  pathReplacementId: string,
  pathReplacementGroups: PathReplacementGroup[]
): PathReplacementGroup[] => {
  const pathReplacementIndex = pathReplacementGroups.findIndex(
    (pr) => pr.id === pathReplacementId
  );
  if (pathReplacementIndex === -1) return [];

  const descendantPathIds = pathReplacementGroups[
    pathReplacementIndex
  ].replacements.flatMap((pr) => pr.replacementPaths.flatMap((r) => r.id));

  const descendantPathReplacements = [
    pathReplacementGroups[pathReplacementIndex],
  ];

  // The pathReplacements should be cronological, hence we only need
  // to check for path replacements after `pathReplacementId`
  for (
    let i = pathReplacementIndex + 1;
    i < pathReplacementGroups.length;
    i++
  ) {
    const curPr = pathReplacementGroups[i];
    const prPathIds = curPr.replacements.map((p) => p.pathId);

    if (prPathIds.some((prPathId) => descendantPathIds.includes(prPathId))) {
      descendantPathIds.push(
        ...curPr.replacements.flatMap((p) =>
          p.replacementPaths.map((r) => r.id)
        )
      );
      descendantPathReplacements.push(curPr);
    }
  }
  return descendantPathReplacements;
};

export const removePathReplacementFromSvg = (
  svg: SVGSVGElement,
  pathReplacement: PathReplacement,
  replacedElement: SVGElement,
  originalStyle: string,
  parentElement: HTMLElement
) => {
  let pathReplacementGroup = svg.getElementById(
    PATH_REPLACEMENT_GROUP
  ) as SVGGElement;
  if (!pathReplacementGroup) {
    pathReplacementGroup = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    );
    pathReplacementGroup.id = PATH_REPLACEMENT_GROUP;
    svg.appendChild(pathReplacementGroup);
  }

  pathReplacement.replacementPaths.forEach((svgPathWithId) => {
    const path = pathReplacementGroup.querySelector(`#${svgPathWithId.id}`);
    if (path) path.remove();
  });

  replacedElement.setAttribute('style', originalStyle);
  parentElement.appendChild(replacedElement);
};
