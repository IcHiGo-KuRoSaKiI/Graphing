# Graphing

Graphing is a lightweight UML-style diagram editor built with React Flow and Tailwind CSS. It can be used as a standalone app or as a library inside another React/Next.js project.

## Features
- Render and edit diagrams from JSON
- Validate against a built‑in schema
- Auto layout helpers
- Copy/paste and delete
- Export to JSON or draw.io XML
- Optional dark mode support with darker canvas and bright icons

## Development

```bash
npm install
npm start
```

Run the test suite:

```bash
npm test
```

## Building the library

The source files are compiled with Babel into the `dist` directory. Build them with:

```bash
npm run build:lib

# Optional: rebuild the stylesheet
npm run build:css
```

This command is also run automatically when publishing thanks to the `prepare` script in `package.json`.

## Using in another project

After running the build you can install the package locally or from npm. In a project that already has React and Tailwind configured run:

```bash
npm install path/to/graphing
# or once published
npm install graphing
```

Import the editor component. The bundled stylesheet is now loaded automatically. All styles are prefixed with the `.graphing` class so they don't clash with your application's CSS. The `ArchitectureDiagramEditor` element already includes this class on its root container.
The optional `mode` prop controls the initial UI theme (`"light"` or `"dark"`). You can also enable a built-in theme switcher in the View menu by passing `showThemeToggle`. For development builds you can expose a menu option to toggle a miniature preview by passing `showMiniToggle` and handling the `onToggleMini` callback. Dark mode now dims the canvas and brightens icons for better contrast.

```jsx
import { ArchitectureDiagramEditor } from 'graphing';

const example = {
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
    <div style={{ width: 600, height: 400 }}>
      <ArchitectureDiagramEditor
        diagram={example}
        mode="dark"
        showThemeToggle
        showMiniToggle
      />
    </div>
  );
}
```

### Publishing to npm

1. Ensure you are logged in with `npm login`.
2. Update the version with `npm version <patch|minor|major>`.
3. Run `npm publish`.

After publishing the package can be installed anywhere with:

```bash
npm install graphing
```

## License
MIT
