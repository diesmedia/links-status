# Links Status

**Links Status** is a lightweight and efficient Node.js module written in TypeScript that parses files to find all http and https links, checks their statuses, and outputs the HTTP response codes. This tool is perfect for validating links in various file types, such as HTML, Markdown, JavaScript, and TypeScript, ensuring all your links are working correctly.

## Features

- **Multi-format Support**: Extract links from HTML, Markdown, JavaScript, and TypeScript files.
- **HTTP Status Check**: Verify the status of each link and capture HTTP response codes.
- **Easy to Use**: Simple and straightforward command-line interface.

## Installation

To install and use the module locally, follow these steps:

1. **Clone the repository**:

```bash
git clone git@github.com:clementvial/links-status.git
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

After building the project, you can run the module:

```bash
npm start <path-to-your-file>
```

Example:

```bash
npm start example.html
```

## Output

The tool outputs the HTTP status codes for each link found in the specified file:

```bash
--- RESULTS ---
500 - https://error.com
404 - https://notfound.com
200 - http://example.com
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
