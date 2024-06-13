import { exec } from 'child_process';
import * as fs from 'fs';
import * as util from 'util';
import * as readline from 'readline';

const execPromise = util.promisify(exec);

export class LinksStatus {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  public async checkLinks(): Promise<void> {
    const fileContent = fs.readFileSync(this.filePath, 'utf-8');
    const links = this.extractLinks(fileContent);
    console.log(`Found ${links.length} links. Checking statuses...`);

    const startTime = Date.now();
    const results = await this.testLinks(links);
    const endTime = Date.now();

    this.printResults(results);
    console.log(`Completed in ${(endTime - startTime) / 1000} seconds.`);
  }

  private extractLinks(content: string): string[] {
    const links: string[] = [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = content.match(urlRegex);

    if (matches) {
      links.push(...matches);
    }

    return links;
  }

  private async testLinks(links: string[]): Promise<{ url: string, status: number }[]> {
    const results: { url: string, status: number }[] = [];

    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      try {
        this.updateProgress(i + 1, links.length);
        const { stdout } = await execPromise(`curl -o /dev/null -s -w "%{http_code}" -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" ${link}`);
        const status = parseInt(stdout.trim(), 10);
        results.push({ url: link, status });
      } catch (error) {
        results.push({ url: link, status: 0 }); // Could not resolve domain or another error
      }
    }

    return results;
  }

  private updateProgress(current: number, total: number): void {
    const progress = (current / total) * 100;
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`Checking links... ${progress.toFixed(2)}% (${current}/${total})`);
  }

  private printResults(results: { url: string, status: number }[]): void {
    console.log('\n--- RESULTS ---');
    results.forEach(result => {
      console.log(`${result.status} - ${result.url}`);
    });
  }
}
