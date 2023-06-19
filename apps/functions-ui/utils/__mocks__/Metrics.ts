export const trackUsage = () => {};
export const trackTimedUsage = jest.fn().mockReturnValue({ stop: jest.fn() });
