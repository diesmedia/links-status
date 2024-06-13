import { LinksStatus } from '../linksStatus';
import * as fs from 'fs';
import { exec } from 'child_process';
import * as util from 'util';
import * as readline from 'readline';

jest.mock('fs');
jest.mock('child_process');
jest.mock('readline');

const mockExec = exec as unknown as jest.Mock;

describe('LinksStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should extract links from content', async () => {
    const fileContent = `
      Here are some links:
      - http://example.com
      - https://another-example.com
    `;

    (fs.readFileSync as jest.Mock).mockReturnValue(fileContent);
    mockExec.mockImplementation((command, callback) => callback(null, { stdout: '200' }));

    const checker = new LinksStatus('dummyPath');
    const links = checker['extractLinks'](fileContent);
    
    expect(links).toEqual([
      'http://example.com',
      'https://another-example.com',
    ]);
  });

  it('should check link statuses correctly', async () => {
    const links = ['http://example.com', 'https://another-example.com'];
    (fs.readFileSync as jest.Mock).mockReturnValue(links.join('\n'));
    mockExec.mockImplementation((command, callback) => callback(null, { stdout: '200' }));

    const checker = new LinksStatus('dummyPath');
    const results = await checker['testLinksConcurrently'](links);

    expect(results).toEqual([
      { url: 'http://example.com', status: 200 },
      { url: 'https://another-example.com', status: 200 },
    ]);
  });

  it('should handle errors when checking link statuses', async () => {
    const links = ['http://example.com', 'https://another-example.com'];
    (fs.readFileSync as jest.Mock).mockReturnValue(links.join('\n'));
    mockExec.mockImplementation((command, callback) => callback(new Error('Network error')));

    const checker = new LinksStatus('dummyPath');
    const results = await checker['testLinksConcurrently'](links);

    expect(results).toEqual([
      { url: 'http://example.com', status: 0 },
      { url: 'https://another-example.com', status: 0 },
    ]);
  });

  it('should print results correctly', () => {
    const results = [
      { url: 'http://example.com', status: 200 },
      { url: 'https://another-example.com', status: 404 },
    ];

    console.log = jest.fn();
    const checker = new LinksStatus('dummyPath');
    checker['printResults'](results);

    expect(console.log).toHaveBeenCalledWith('\n--- RESULTS ---');
    expect(console.log).toHaveBeenCalledWith('200 - http://example.com');
    expect(console.log).toHaveBeenCalledWith('404 - https://another-example.com');
  });

  it('should update progress correctly', () => {
    const checker = new LinksStatus('dummyPath');
    jest.spyOn(readline, 'clearLine').mockImplementation((stream, dir, callback) => true);
    jest.spyOn(readline, 'cursorTo').mockImplementation((stream, x, y, callback) => true);
    jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

    checker['updateProgress'](1, 3);
    
    expect(readline.clearLine).toHaveBeenCalledWith(process.stdout, 0);
    expect(readline.cursorTo).toHaveBeenCalledWith(process.stdout, 0);
    expect(process.stdout.write).toHaveBeenCalledWith('Checking links... 33.33% (1/3)');
  });
});
