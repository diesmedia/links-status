// src/__mocks__/fs.js
module.exports = {
  readFile: jest.fn((filePath, options, callback) => {
    if (filePath === 'test.txt') {
      callback(null, 'file content with https://example.com');
    } else {
      callback(new Error('File not found'), null);
    }
  }),
};
