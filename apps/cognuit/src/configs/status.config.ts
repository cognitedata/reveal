import { HeartbeatsConnector } from 'pages/Status/types';
import { Source } from 'typings/interfaces';

export const statusConfig: {
  beatsInADay: number;
  connectors: HeartbeatsConnector[];
} = {
  beatsInADay: 72, // 3 beats (20 min each) in 1 hour = 72 beats for 24h
  connectors: [
    {
      source: Source.OPENWORKS,
      instance: 'iEnergy-prod',
    },
    {
      source: Source.OPENWORKS,
      instance: 'iEnergy-pre-prod',
    },
    {
      source: Source.STUDIO,
      instance: 'AkerBP-prod',
    },
    {
      source: Source.STUDIO,
      instance: 'AkerBP-test',
    },
  ],
};
