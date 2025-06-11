import React, { useState, useCallback } from 'react';
import { ChevronDown, File, Edit, Eye, Settings, HelpCircle } from 'lucide-react';

const MenuBar = ({
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onImportJSON,
  onImportDrawio,
  onExportJSON,
  onExportDrawio,
  onExportPNG,
  onExportSVG,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onSelectAll,
  onDeselectAll,
  canUndo = false,
  canRedo = false,
  hasSelection = false,
  hasClipboard = false
}) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMenuClick = useCallback((menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  }, [activeMenu]);

  const handleMenuItemClick = useCallback((action) => {
    action();
    setActiveMenu(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveMenu(null);
  }, []);

  const MenuButton = ({ name, icon: Icon, children }) => (
    <div
      className="menu-button-container"
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`menu-button ${activeMenu === name ? 'active' : ''}`}
        onClick={() => handleMenuClick(name)}
        onMouseEnter={() => activeMenu && setActiveMenu(name)}
      >
        <Icon size={16} />
        <span>{name}</span>
        <ChevronDown size={12} />
      </button>

      {activeMenu === name && (
        <div className="menu-dropdown">
          {children}
        </div>
      )}
    </div>
  );

  const MenuItem = ({ onClick, disabled = false, children, shortcut = null, separator = false }) => {
    if (separator) {
      return <div className="menu-separator" />;
    }

    return (
      <div
        className={`menu-item ${disabled ? 'disabled' : ''}`}
        onClick={disabled ? undefined : () => handleMenuItemClick(onClick)}
      >
        <span className="menu-item-text">{children}</span>
        {shortcut && <span className="menu-shortcut">{shortcut}</span>}
      </div>
    );
  };

  return (
    <div className="menu-bar">
      <style jsx>{`
        .menu-bar {
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 0;
          position: relative;
          z-index: 1001;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .menu-button-container {
          position: relative;
        }

        .menu-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: transparent;
          border: none;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 4px;
          margin: 4px 2px;
        }

        .menu-button:hover,
        .menu-button.active {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }

        .menu-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          min-width: 200px;
          z-index: 1002;
          padding: 4px 0;
          margin-top: 2px;
          animation: menuSlideIn 0.15s ease-out;
        }

        @keyframes menuSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          cursor: pointer;
          font-size: 14px;
          color: #495057;
          transition: all 0.2s ease;
          position: relative;
        }

        .menu-item:hover:not(.disabled) {
          background: linear-gradient(135deg, #f8f9ff 0%, #e6f0ff 100%);
          color: #667eea;
        }

        .menu-item.disabled {
          color: #adb5bd;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .menu-item-text {
          flex: 1;
        }

        .menu-shortcut {
          font-size: 12px;
          color: #6c757d;
          background: #f8f9fa;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 12px;
        }

        .menu-separator {
          height: 1px;
          background: #e9ecef;
          margin: 4px 0;
        }

        .submenu-indicator {
          margin-left: 8px;
          font-size: 10px;
          color: #6c757d;
        }
      `}</style>

      <MenuButton name="File" icon={File}>
        <MenuItem onClick={onNew} shortcut="Ctrl+N">
          New Diagram
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={onOpen} shortcut="Ctrl+O">
          Open...
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={onSave} shortcut="Ctrl+S">
          Save
        </MenuItem>
        <MenuItem onClick={onSaveAs} shortcut="Ctrl+Shift+S">
          Save As...
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={onImportJSON}>
          Import JSON...
        </MenuItem>
        <MenuItem onClick={onImportDrawio}>
          Import Draw.io XML...
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={onExportJSON}>
          Export as JSON
        </MenuItem>
        <MenuItem onClick={onExportDrawio}>
          Export as Draw.io XML
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={onExportPNG}>
          Export as PNG
        </MenuItem>
        <MenuItem onClick={onExportSVG}>
          Export as SVG
        </MenuItem>
      </MenuButton>

      <MenuButton name="Edit" icon={Edit}>
        <MenuItem onClick={onUndo} disabled={!canUndo} shortcut="Ctrl+Z">
          Undo
        </MenuItem>
        <MenuItem onClick={onRedo} disabled={!canRedo} shortcut="Ctrl+Y">
          Redo
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={onCut} disabled={!hasSelection} shortcut="Ctrl+X">
          Cut
        </MenuItem>
        <MenuItem onClick={onCopy} disabled={!hasSelection} shortcut="Ctrl+C">
          Copy
        </MenuItem>
        <MenuItem onClick={onPaste} disabled={!hasClipboard} shortcut="Ctrl+V">
          Paste
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={onDelete} disabled={!hasSelection} shortcut="Delete">
          Delete
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={onSelectAll} shortcut="Ctrl+A">
          Select All
        </MenuItem>
        <MenuItem onClick={onDeselectAll} disabled={!hasSelection}>
          Deselect All
        </MenuItem>
      </MenuButton>

      <MenuButton name="View" icon={Eye}>
        <MenuItem onClick={() => { }}>
          Zoom In
        </MenuItem>
        <MenuItem onClick={() => { }}>
          Zoom Out
        </MenuItem>
        <MenuItem onClick={() => { }}>
          Fit to Screen
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={() => { }}>
          Show Grid
        </MenuItem>
        <MenuItem onClick={() => { }}>
          Show Rulers
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={() => { }}>
          Toggle Minimap
        </MenuItem>
        <MenuItem onClick={() => { }}>
          Toggle Properties Panel
        </MenuItem>
      </MenuButton>

      <MenuButton name="Tools" icon={Settings}>
        <MenuItem onClick={() => { }}>
          Diagram Templates...
        </MenuItem>
        <MenuItem onClick={() => { }}>
          JSON Schema Validator
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={() => { }}>
          Auto-Layout
        </MenuItem>
        <MenuItem onClick={() => { }}>
          Align Elements
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={() => { }}>
          Preferences...
        </MenuItem>
      </MenuButton>

      <MenuButton name="Help" icon={HelpCircle}>
        <MenuItem onClick={() => { }}>
          Keyboard Shortcuts
        </MenuItem>
        <MenuItem onClick={() => { }}>
          User Guide
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={() => { }}>
          About
        </MenuItem>
      </MenuButton>
    </div>
  );
};

export default MenuBar;