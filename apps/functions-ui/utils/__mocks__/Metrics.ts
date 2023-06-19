import jest from 'jest-mock';
import _ from 'lodash';
export const trackUsage = _.noop;
export const trackTimedUsage = jest.fn().mockReturnValue({ stop: jest.fn() });
