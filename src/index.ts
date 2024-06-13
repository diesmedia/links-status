import { LinksStatus } from './linksStatus';

const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide a file path as an argument.');
  process.exit(1);
}

const statusChecker = new LinksStatus(filePath);
statusChecker.checkLinks().catch(error => {
  console.error('Error checking links:', error);
});