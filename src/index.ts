import { LinksStatus } from './linksStatus.js';

const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide a file path as an argument.');
  process.exit(1);
}

const statusChecker = new LinksStatus(filePath);
statusChecker.checkLinks().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error('Error checking links:', error.message);
  } else {
    console.error('Unexpected error', error);
  }
});
