import {
  pathSegmentsToSvgCommands,
  svgCommandsToPathSegments,
} from '../svgPathParser';
import { LineSegment } from '..';

describe('svg-commands', () => {
  test('M + V', () => {
    const segments = svgCommandsToPathSegments('M 100,100 V 200');
    expect(segments.length).toEqual(1);
    expect(segments[0] instanceof LineSegment).toBe(true);
    expect(segments[0].start.x).toBe(100);
    expect(segments[0].start.y).toBe(100);
    expect(segments[0].stop.x).toBe(100);
    expect(segments[0].stop.y).toBe(200);
  });

  test('M + H', () => {
    const segments = svgCommandsToPathSegments('M 100,100 H 200');
    expect(segments.length).toEqual(1);
    expect(segments[0] instanceof LineSegment).toBe(true);
    expect(segments[0].start.x).toBe(100);
    expect(segments[0].start.y).toBe(100);
    expect(segments[0].stop.x).toBe(200);
    expect(segments[0].stop.y).toBe(100);
  });

  test('M + L', () => {
    const segments = svgCommandsToPathSegments('M 100,100 L 200,300');
    expect(segments.length).toEqual(1);
    expect(segments[0] instanceof LineSegment).toBe(true);
    expect(segments[0].start.x).toBe(100);
    expect(segments[0].start.y).toBe(100);
    expect(segments[0].stop.x).toBe(200);
    expect(segments[0].stop.y).toBe(300);
  });

  test('M + Z', () => {
    const segments = svgCommandsToPathSegments('M 100,100 V 200 H 200 Z');

    expect(segments.length).toEqual(3);
    expect(segments[0].start.x).toBe(100);
    expect(segments[0].start.y).toBe(100);
    expect(segments[0].stop.x).toBe(100);
    expect(segments[0].stop.y).toBe(200);

    expect(segments[1].start.x).toBe(100);
    expect(segments[1].start.y).toBe(200);
    expect(segments[1].stop.x).toBe(200);
    expect(segments[1].stop.y).toBe(200);

    expect(segments[2].start.x).toBe(200);
    expect(segments[2].start.y).toBe(200);
    expect(segments[2].stop.x).toBe(100);
    expect(segments[2].stop.y).toBe(100);
  });

  test('Double M + Z', () => {
    const segments = svgCommandsToPathSegments(
      'M 10,20 L 30,40 Z M 50,60 L 70,80 Z'
    );

    expect(segments.length).toEqual(4);

    expect(segments[0].start.x).toBe(10);
    expect(segments[0].start.y).toBe(20);
    expect(segments[0].stop.x).toBe(30);
    expect(segments[0].stop.y).toBe(40);

    expect(segments[1].start.x).toBe(30);
    expect(segments[1].start.y).toBe(40);
    expect(segments[1].stop.x).toBe(10);
    expect(segments[1].stop.y).toBe(20);

    // Second M
    expect(segments[2].start.x).toBe(50);
    expect(segments[2].start.y).toBe(60);
    expect(segments[2].stop.x).toBe(70);
    expect(segments[2].stop.y).toBe(80);

    expect(segments[3].start.x).toBe(70);
    expect(segments[3].start.y).toBe(80);
    expect(segments[3].stop.x).toBe(50);
    expect(segments[3].stop.y).toBe(60);
  });

  test('M + C', () => {
    const segments = svgCommandsToPathSegments(
      'M 10,20 C 20.1,30.2 40.3,50.4 60.5,70.6'
    );

    expect(segments.length).toEqual(1);
    expect(segments[0].start.x).toBe(10);
    expect(segments[0].start.y).toBe(20);
    expect(segments[0].stop.x).toBe(60.5);
    expect(segments[0].stop.y).toBe(70.6);
  });
});

describe('svgPathCommand -> pathSegmetList -> svgPathCommand', () => {
  test('M + V', () => {
    const segments = svgCommandsToPathSegments('M 100,100 V 200');

    const newSegments = svgCommandsToPathSegments(
      pathSegmentsToSvgCommands(segments)
    );
    expect(segments.length).toEqual(newSegments.length);

    for (let i = 0; i < segments.length; i++) {
      expect(segments[i].isEqual(newSegments[i])).toEqual(true);
    }
  });

  test('M + C', () => {
    const segments = svgCommandsToPathSegments(
      'M 10,20 C 20.1,30.2 40.3,50.4 60.5,70.6'
    );
    const newSegments = svgCommandsToPathSegments(
      pathSegmentsToSvgCommands(segments)
    );
    expect(segments.length).toEqual(newSegments.length);

    for (let i = 0; i < segments.length; i++) {
      expect(segments[i].isEqual(newSegments[i])).toEqual(true);
    }
  });

  test('Double M + Z', () => {
    const segments = svgCommandsToPathSegments(
      'M 10,20 L 30,40 Z M 50,60 L 70,80 Z'
    );
    const newSegments = svgCommandsToPathSegments(
      pathSegmentsToSvgCommands(segments)
    );
    expect(segments.length).toEqual(newSegments.length);

    for (let i = 0; i < segments.length; i++) {
      expect(segments[i].isEqual(newSegments[i])).toEqual(true);
    }
  });
});
