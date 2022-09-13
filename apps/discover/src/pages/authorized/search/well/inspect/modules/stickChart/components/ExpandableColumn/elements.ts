import styled from 'styled-components/macro';

import { DURATION } from 'styles/transition';

import { BodyColumn } from '../../../common/Events/elements';

export const BodyColumnWrapper = styled(BodyColumn)`
  transition: min-width ${DURATION.FAST};
`;
