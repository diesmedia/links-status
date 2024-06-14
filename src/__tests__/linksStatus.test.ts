import { jest } from '@jest/globals';
import { LinksStatus } from '../linksStatus'; // Ensure this matches the actual file name's casing
import * as fs from 'fs';
import * as util from 'util';
import { exec } from 'child_process';

jest.mock('fs');
jest.mock('util');

describe('LinksStatus', () => {
    const mockFilePath = 'test.txt';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create an instance with the correct file path', () => {
        const linksStatus = new LinksStatus(mockFilePath);
        expect(linksStatus).toBeDefined();
    });

    it('should read file content correctly', async () => {
        // @ts-ignore
        jest.spyOn(fs, 'readFile').mockImplementation((filePath, options, callback) => {
            callback(null, 'file content with https://example.com');
        });
        const linksStatus = new LinksStatus(mockFilePath);
        const content = await linksStatus['readFileAsync'](mockFilePath, 'utf-8');

        expect(content).toBe('file content with https://example.com');
        expect(fs.readFile).toHaveBeenCalledWith(mockFilePath, { encoding: 'utf-8' }, expect.any(Function));
    });

    it('should extract links from content', () => {
        const linksStatus = new LinksStatus(mockFilePath);
        const content = 'Here are some links: https://example.com and http://test.com';
        const links = linksStatus['extractLinks'](content);

        expect(links).toEqual(['https://example.com', 'http://test.com']);
    });

    it('should test links concurrently', async () => {
        // @ts-ignore
        const mockExecPromise = jest.fn().mockResolvedValue({ stdout: '200' });

        // @ts-ignore
        const linksStatus = new LinksStatus(mockFilePath, mockExecPromise);
        const links = ['https://example.com', 'http://test.com'];
        const results = await linksStatus['testLinksConcurrently'](links);

        console.log(results);

        expect(results).toEqual([
            { url: 'https://example.com', status: 200 },
            { url: 'http://test.com', status: 200 },
        ]);
        expect(mockExecPromise).toHaveBeenCalledTimes(2); // Ensure execPromise was called for each link
    });

    it('should print results correctly', () => {
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        const linksStatus = new LinksStatus(mockFilePath);
        const results = [
            { url: 'https://example.com', status: 200 },
            { url: 'http://test.com', status: 404 },
            { url: 'http://server-error.com', status: 500 },
        ];

        linksStatus['printResults'](results);

        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('200 - https://example.com'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('404 - http://test.com'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('500 - http://server-error.com'));

        consoleLogSpy.mockRestore();
    });
});
