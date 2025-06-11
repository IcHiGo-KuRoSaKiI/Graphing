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

Pass a JSON diagram object to render your own data. The editor fills its parent container so be sure to give that element a size:

```javascript
const exampleDiagram = {
  containers: [
    {
      id: 'container-1',
      label: 'Frontend',
      position: { x: 100, y: 100 },
      size: { width: 300, height: 200 },
      icon: '🖥️'
    }
  ],
  nodes: [
    {
      id: 'component-1',
      label: 'React UI',
      position: { x: 120, y: 150 },
      parentContainer: 'container-1'
    }
  ],
  connections: []
};

function Example() {
  return (
    <div style={{ width: '600px', height: '400px' }}>
      <ArchitectureDiagramEditor diagram={exampleDiagram} />
    </div>
  );
}
```

### Complex example

Below is a larger JSON snippet demonstrating two containers with several components and their connections. You can paste this JSON into the import dialog or pass it to the editor via the `diagram` prop.

Node objects do not need a `type` field; components are assumed by default.

```json
{
  "containers": [
    {
      "id": "container-frontend",
      "label": "Frontend",
      "position": { "x": 50, "y": 50 },
      "size": { "width": 300, "height": 250 },
      "icon": "🌐"
    },
    {
      "id": "container-backend",
      "label": "Backend",
      "position": { "x": 450, "y": 50 },
      "size": { "width": 300, "height": 250 },
      "icon": "🗄️"
    }
  ],
  "nodes": [
    { "id": "component-browser", "label": "Browser", "position": { "x": 80, "y": 100 }, "parentContainer": "container-frontend" },
    { "id": "component-webapp", "label": "Web App", "position": { "x": 180, "y": 160 }, "parentContainer": "container-frontend" },
    { "id": "component-api", "label": "API Server", "position": { "x": 480, "y": 120 }, "parentContainer": "container-backend" },
    { "id": "component-db", "label": "Database", "position": { "x": 560, "y": 180 }, "parentContainer": "container-backend" },
    { "id": "component-cache", "label": "Cache", "position": { "x": 640, "y": 140 }, "parentContainer": "container-backend" }
  ],
  "connections": [
    { "id": "edge-browser-webapp", "source": "component-browser", "target": "component-webapp", "label": "HTTP" },
    { "id": "edge-webapp-api", "source": "component-webapp", "target": "component-api", "label": "REST" },
    { "id": "edge-api-db", "source": "component-api", "target": "component-db", "label": "Queries" },
    { "id": "edge-api-cache", "source": "component-api", "target": "component-cache", "label": "Fast path" }
  ]
}
```
