export function getLineRange(sampleCount?: number) {
  return {
    inline: {
      min: { value: 100 },
      max: { value: 500 },
      step: { value: 1 }
    },
    xline: {
      min: { value: 100 },
      max: { value: 500 },
      step: { value: 1 } },
    traceValueRange: {
      minValue: -1000.9375,
      maxValue: 1000.9375
    },
    traceSampleCount: sampleCount === undefined
      ? undefined
      : { value: sampleCount }
  }
}

export function getFulfilledTrace(traceLength = 400) {
  return {
    traceHeader: 'A/A',
    iline: { value: 100 },
    xline: { value: 300 },
    traceList: (new Array(traceLength).fill(0)),
    coordinate: {
      crs: '',
      x: 605835.5,
      y: 6073556.5
    }
  }
}

export const traceRejected = 'Trace not found';