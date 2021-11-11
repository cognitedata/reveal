import { parseSVG, makeAbsolute, CommandMadeAbsolute } from 'svg-path-parser';

import { CurveSegment, LineSegment, PathSegment, Point } from '../PathSegments';

export const getSegments = (commands: CommandMadeAbsolute[]): PathSegment[] => {
  const segments: PathSegment[] = [];

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    if (
      command.code === 'L' ||
      command.code === 'V' ||
      command.code === 'H' ||
      command.code === 'Z'
    ) {
      segments.push(
        new LineSegment(
          new Point(command.x0, command.y0),
          new Point(command.x, command.y)
        )
      );
    } else if (command.code === 'C') {
      segments.push(
        new CurveSegment(
          new Point(command.x1, command.y1),
          new Point(command.x2, command.y2),
          new Point(command.x0, command.y0),
          new Point(command.x, command.y)
        )
      );
    }
  }
  return segments;
};

export const svgCommandToSegments = (d: string): PathSegment[] => {
  const commands = makeAbsolute(parseSVG(d));
  return getSegments(commands);
};
