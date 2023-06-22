Object.defineProperty(window, 'location', {
  value: jest.fn().mockImplementation(() => ({
    href: jest.fn(),
    pathName: jest.fn(),
  })),
});
