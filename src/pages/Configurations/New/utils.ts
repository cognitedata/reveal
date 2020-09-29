function drawBetweenObjects(
  line: SVGElement,
  sourceEl: HTMLElement,
  targetEl: HTMLElement
) {
  // calculations (for legibility, these are separte vars)
  const sourceOffset = sourceEl.getBoundingClientRect();
  const targetOffset = targetEl.getBoundingClientRect();
  const x1 = sourceOffset.left + sourceOffset.width / 2;
  const y1 = sourceOffset.top + sourceOffset.height / 2;
  const x2 = targetOffset.left + targetOffset.width / 2;
  const y2 = targetOffset.top + targetOffset.height / 2;
  // mid-point of line:
  const mpx = (x2 + x1) * 0.5;
  const mpy = (y2 + y1) * 0.5;

  // angle of perpendicular to line:
  const theta = Math.atan2(y1 - y2, x1 - x2) - Math.PI / 2;

  // distance of control point from mid-point of line:
  const offset = 90;

  // location of control point:
  const c1x = mpx + offset * Math.cos(theta);
  const c1y = mpy + offset * Math.sin(theta);
  // construct the command to draw a quadratic curve
  const curve = `M${x1} ${y1} Q ${c1x} ${c1y} ${x2} ${y2}`;
  line.setAttribute('d', curve);
}

export const makeConnectorLines = () => {
  const config = {
    points: document.querySelectorAll('.connectorPoint'),
    lines: document.querySelectorAll('.connectorLine'),
    target: document.querySelector('#connectorTarget'),
  };
  if (config.points.length > 0 && config.lines.length > 0 && config.target) {
    for (let i = 0; i < config.lines.length; i++) {
      drawBetweenObjects(
        config.lines[i] as SVGElement,
        config.points[i] as HTMLElement,
        config.target as HTMLElement
      );
    }
  }
};
