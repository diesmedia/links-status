# links-status

**links-status** is a lightweight and efficient Node.js module written in TypeScript that parses files to find all `http` and `https` links, checks their statuses, and outputs the HTTP response codes. This tool is perfect for validating links in various file types, such as HTML, Markdown, JavaScript, and TypeScript, ensuring all your links are working correctly.

## Features

- **Multi-format Support**: Extract links from HTML, Markdown, JavaScript, and TypeScript files.
- **HTTP Status Check**: Verify the status of each link and capture HTTP response codes.
- **Easy to Use**: Simple and straightforward command-line interface.
- **Asynchronous**: Efficiently handles multiple link checks concurrently using asynchronous operations.

## Installation

To install and use the module locally, follow these steps:

1. **Clone the repository**:

```bash
git clone <repository-url>
cd links-status
```

2. **Install dependencies:**:
```bash
npm install
```

3. **Build the project:**:
```bash
npm run build
```

## Usage

After building the project, you can run the module using `npx`:

```bash
npx ts-node dist/index.js <path-to-your-file>
```

Example:

```bash
npx ts-node dist/index.js example.html
```

## Output

The tool outputs the HTTP status codes for each link found in the specified file:

```bash
--- RESULTS ---
200 - http://example.com
404 - https://notfound.com
500 - https://error.com
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.