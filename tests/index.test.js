/**
 * Unit Test for src/index.js template
 */

const { initializeApp } = require('../src/index');

describe('src/index.js tests', () => {
  test('initializeApp returns true', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    expect(initializeApp()).toBe(true);
    expect(logSpy).toHaveBeenCalledWith("AI Agent Guardian is active and protecting your codebase.");
    logSpy.mockRestore();
  });
});
