import * as fs from 'fs';
import Puppeteer, {Browser, PDFOptions} from "puppeteer";

export class LinksStatus {
  private filePath: string;
  private userAgents: string[];

  constructor(filePath: string) {
    this.filePath = filePath;
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/89.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1'
    ];
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
      fs.readFile(filePath, {encoding: encoding as BufferEncoding}, (err, data) => {
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

  private async testLinksConcurrently(links: string[]): Promise<{url: string, status: number}[]> {
    const batchSize = 10;
    const results: {url: string, status: number}[] = [];

    const browser = await Puppeteer.launch();
    for (let i = 0; i < links.length; i += batchSize) {
      const batchLinks = links.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(links.length / batchSize)}`);

      await Promise.all(batchLinks.map((link, index) =>
        this.getStatusWithPuppeteer(browser, link, index).then(status => {
          results.push({url: link, status});
          console.log(`  - ${link}`);
        }).catch(error => {
          results.push({url: link, status: 0});
          console.log(`  - ${link} (Error: ${error.message || error})`);
        })
      ));
    }

    await browser.close();
    return results;
  }

  private async getStatusWithPuppeteer(browser: Browser, url: string, index: number): Promise<number> {
    const page = await browser.newPage();
    const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    await page.setUserAgent(userAgent);

    let status = 0;
    try {
      const response = await this.retryWithBackoff(async () => {
        return page.goto(url, {waitUntil: 'domcontentloaded', timeout: 15000});
      });
      status = response?.status() || 0;
    } catch (error) {
      console.error(`Error navigating to ${url}:`, error);
    } finally {
      await page.close();
    }

    // Introduce delay to avoid hitting rate limits
    await this.delay(index * 1000);
    return status;
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>, retries = 5, delay = 1000): Promise<T> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await fn();
      } catch (error: any) {
        if (error.response?.status === 429) {
          attempt++;
          const backoffDelay = delay * Math.pow(2, attempt);
          console.log(`Received 429. Retrying in ${backoffDelay}ms...`);
          await this.delay(backoffDelay);
        } else {
          throw error;
        }
      }
    }
    throw new Error('Max retries reached');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private printResults(results: {url: string, status: number}[]): void {
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
