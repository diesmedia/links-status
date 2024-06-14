import { exec } from 'child_process';
import * as util from 'util';
import * as fs from 'fs';

const execPromise = util.promisify(exec);

export class LinksStatus {
    private filePath: string;
    private execPromise: (command: string) => Promise<{ stdout: string }>;

    constructor(filePath: string, execPromise: (command: string) => Promise<{ stdout: string }> = util.promisify(exec)) {
        this.filePath = filePath;
        this.execPromise = execPromise;
    }

    public async checkLinks(): Promise<void> {
        try {
            const fileContent = await this.readFileAsync(this.filePath, 'utf-8');
            const links = this.extractLinks(fileContent);
            console.log(`Found ${links.length} links. Checking statuses...`);

            const startTime = Date.now();
            const results = await this.testLinksConcurrently(links);
            const endTime = Date.now();

            this.printResults(results);
            console.log(`Completed in ${(endTime - startTime) / 1000} seconds.`);
        } catch (error) {
            console.error('Error reading file:', error);
        }
    }

    private async readFileAsync(filePath: string, encoding: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(filePath, { encoding: encoding as BufferEncoding }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.toString());
                }
            });
        });
    }

    private extractLinks(content: string): string[] {
        const links: string[] = [];
        const urlRegex = /https?:\/\/[^\s"')]+/g;
        const matches = content.match(urlRegex);

        if (matches) {
            links.push(...matches.map(link => link.replace(/["'<>]/g, '')));
        }

        return links;
    }

    private async testLinksConcurrently(links: string[]): Promise<{ url: string, status: number }[]> {
        const batchSize = 10;
        const results: { url: string, status: number }[] = [];

        for (let i = 0; i < links.length; i += batchSize) {
            const batchLinks = links.slice(i, i + batchSize);
            console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(links.length / batchSize)}`);

            await Promise.all(batchLinks.map(async (link) => {
                try {
                    const { stdout } = await this.execPromise(`curl -o /dev/null -s -w "%{http_code}" -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" ${link}`);
                    const status = parseInt(stdout.trim(), 10);
                    results.push({ url: link, status });
                    console.log(`  - ${link}`);
                } catch (error: any) {
                    results.push({ url: link, status: 0 });
                    console.log(`  - ${link} (Error: ${error.message || error})`);
                }
            }));
        }

        return results;
    }

    private printResults(results: { url: string, status: number }[]): void {
        console.log('\n--- RESULTS ---');

        const sortedResults = results.sort((a, b) => {
            const categoryA = this.getStatusCategory(a.status);
            const categoryB = this.getStatusCategory(b.status);
            return categoryA - categoryB || a.status - b.status;
        });

        sortedResults.forEach(result => {
            let color = '\x1b[32m';

            if (result.status === 0 || result.status >= 500) {
                color = '\x1b[31m';
            } else if (result.status >= 400) {
                color = '\x1b[33m';
            } else if (result.status >= 300) {
                color = '\x1b[35m';
            }

            console.log(`${color}${result.status} - ${result.url}\x1b[0m`);
        });
    }

    private getStatusCategory(status: number): number {
        if (status === 0) return 0;
        if (status >= 500) return 1;
        if (status >= 400) return 2;
        if (status >= 300) return 3;
        if (status >= 200) return 4;
        return 5;
    }
}
