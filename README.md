# Graphing

This project is a lightweight UML-style editor built with React Flow and Tailwind CSS. It supports creating diagrams composed of containers and components that can be linked together.

## Features

- Render and edit diagrams from JSON
- Paste raw JSON or import a file
- Validate diagrams with a built-in JSON Schema
- Auto-layout to position containers side by side and arrange their children
- Copy, paste and delete elements
- Export to JSON or draw.io XML

## Development

Install dependencies and start the dev server:

```bash
npm install
npm start
```

Run tests:

```bash
npm test
```

## Using as a package

Build the library files before publishing or installing from a local checkout:

```bash
npm run lib:build
```

Once built, you can install this project in another React application and
import the editor components:

```javascript
import { ArchitectureDiagramEditor } from 'graphing';
```
