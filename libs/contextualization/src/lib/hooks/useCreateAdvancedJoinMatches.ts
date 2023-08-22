import { useMutation } from '@tanstack/react-query';

import { MatchItem } from '../types';

export const useCreateAdvancedJoinMatches = () => {
  return useMutation(async (items: MatchItem[]) => {
    const body = JSON.stringify({
      items: items,
    });

    const response = await fetch(
      `https://localhost:8443/api/v1/projects/contextualization/context/advancedjoins/matches`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      }
    );

    return response.json();
  });
};
