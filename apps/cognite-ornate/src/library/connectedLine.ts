import Konva from 'konva';
import { Line } from 'konva/lib/shapes/Line';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Box = { x: number; y: number; width: number; height: number };

export class ConnectedLine {
  nodeA: Konva.Node;
  nodeB: Konva.Node;
  line: Konva.Line;
  stage: Konva.Stage;

  constructor(nodeA: Konva.Node, nodeB: Konva.Node, stage: Konva.Stage) {
    this.stage = stage;
    this.nodeA = nodeA;
    this.nodeB = nodeB;

    const { A: pointA, B: pointB } = this.calculateDirection();

    this.line = new Line({
      points: [pointA.x, pointA.y, pointB.x, pointB.y],
      stroke: 'black',
      strokeWidth: 5,
      dash: [8, 4],
    });
  }

  getPointOnRect = (A: Box, direction: Direction) => {
    switch (direction) {
      case 'UP':
        return {
          x: A.x + A.width / 2,
          y: A.y,
        };

      case 'DOWN':
        return {
          x: A.x + A.width / 2,
          y: A.y + A.height,
        };

      case 'LEFT':
        return {
          x: A.x,
          y: A.y + A.height / 2,
        };

      case 'RIGHT':
        return {
          x: A.x + A.width,
          y: A.y + A.height / 2,
        };
      default:
        return {
          x: A.x,
          y: A.y,
        };
    }
  };
  calculateDirection() {
    // @ts-ignore
    const A = this.nodeA.getClientRect({ relativeTo: this.stage });
    // @ts-ignore
    const B = this.nodeB.getClientRect({ relativeTo: this.stage });

    // Get your highschool math ready!
    // First, get the degree between two points.
    const radians = Math.atan2(B.y - A.y, B.x - A.x);

    // Lets convert that to degrees to make our life easier
    const degree = radians * (180 / Math.PI);
    // 0 deg -> right. 180deg -> left. 90deg -> down. -90deg -> up.
    // -135 -> -45 = up.
    if (degree > -135 && degree < -45) {
      return {
        A: this.getPointOnRect(A, 'UP'),
        B: this.getPointOnRect(B, 'DOWN'),
      };
    }

    // -45 -> 45 = right
    if (degree > -45 && degree < 45) {
      return {
        A: this.getPointOnRect(A, 'RIGHT'),
        B: this.getPointOnRect(B, 'LEFT'),
      };
    }

    // 45 -> 135 = down
    if (degree < 135 && degree > 45) {
      return {
        A: this.getPointOnRect(A, 'DOWN'),
        B: this.getPointOnRect(B, 'UP'),
      };
    }

    // 135 -> 180/-180 -> -135 = left (default)
    return {
      A: this.getPointOnRect(A, 'LEFT'),
      B: this.getPointOnRect(B, 'RIGHT'),
    };
  }

  update() {
    const { A: pointA, B: pointB } = this.calculateDirection();
    this.line.points([pointA.x, pointA.y, pointB.x, pointB.y]);
  }
}
