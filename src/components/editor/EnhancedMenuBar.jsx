import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, File, Edit, Eye, Settings, HelpCircle, Plus, Link, Unlink, Copy, Trash } from 'lucide-react';

const EnhancedMenuBar = ({
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onImportJSON,
  onImportJSONText,
  onImportDrawio,
  onExportJSON,
  onExportDrawio,
  onExportPNG,
  onExportJPG,
  onExportSVG,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onSelectAll,
  onDeselectAll,
  onAddContainer,
  onAddComponent,
  onAddShape,
  onLinkNodes,
  onUnlinkNodes,
  onValidateJSON,
  onAutoLayout,
  onTogglePropertiesPanel,
  onToggleStatsPanel,
  onToggleTheme,
  showThemeToggle = false,
  onToggleMini,
  showMiniToggle = false,
  canUndo = false,
  canRedo = false,
  hasSelection = false,
  hasClipboard = false,
  canLink = false
}) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = useCallback((menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  }, [activeMenu]);

  const handleMenuItemClick = useCallback((action) => {
    if (action) {
      action();
    }
    setActiveMenu(null);
  }, []);

  const MenuButton = ({ name, icon: Icon, children }) => (
    <div className="relative">
      <button
        className={`flex items-center gap-2 px-3 py-1.5 text-gray-800 text-sm font-medium rounded-md transition-colors ${activeMenu === name
          ? 'bg-gray-200 dark:bg-gray-700 shadow-sm'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        onClick={() => handleMenuClick(name)}
      >
        <Icon size={16} />
        <span>{name}</span>
        <ChevronDown size={12} />
      </button>

      {activeMenu === name && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg min-w-[200px] z-50 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );

  const MenuItem = ({ onClick, disabled = false, children, shortcut = null, separator = false, icon: Icon = null }) => {
    if (separator) {
      return <div className="h-px my-1 bg-gray-200 dark:bg-gray-700" />;
    }

    return (
      <div
        className={`flex items-center justify-between px-4 py-2.5 text-gray-700 dark:text-gray-200 text-sm cursor-pointer transition-all ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-x-0.5'
          }`}
        onClick={disabled ? undefined : () => handleMenuItemClick(onClick)}
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon size={14} />}
          {children}
        </span>
        {shortcut && (
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded font-mono border border-gray-200 dark:border-gray-600">
            {shortcut}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className="flex items-center bg-white dark:bg-gray-900 p-0 relative z-10 border-b border-gray-200 dark:border-gray-700"
    >
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
        <MenuItem onClick={onImportJSONText}>
          Paste JSON...
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
        <MenuItem onClick={onExportJPG}>
          Export as JPG
        </MenuItem>
        <MenuItem onClick={onExportSVG}>
          Export as SVG
        </MenuItem>
      </MenuButton>

      <MenuButton name="Edit" icon={Edit}>
        <MenuItem onClick={onUndo} disabled={!canUndo} shortcut="Ctrl+Z" icon={ChevronDown}>
          Undo
        </MenuItem>
        <MenuItem onClick={onRedo} disabled={!canRedo} shortcut="Ctrl+Y">
          Redo
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={onCut} disabled={!hasSelection} shortcut="Ctrl+X">
          Cut
        </MenuItem>
        <MenuItem onClick={onCopy} disabled={!hasSelection} shortcut="Ctrl+C" icon={Copy}>
          Copy
        </MenuItem>
        <MenuItem onClick={onPaste} disabled={!hasClipboard} shortcut="Ctrl+V">
          Paste
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={onDelete} disabled={!hasSelection} shortcut="Delete" icon={Trash}>
          Delete
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={onSelectAll} shortcut="Ctrl+A">
          Select All
        </MenuItem>
        <MenuItem onClick={onDeselectAll} disabled={!hasSelection}>
          Deselect All
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={onAddContainer} icon={Plus}>
          Add Container
        </MenuItem>
        <MenuItem onClick={onAddComponent}>
          Add Component
        </MenuItem>
        <MenuItem onClick={onAddShape}>
          Add Shape
        </MenuItem>
      </MenuButton>

      <MenuButton name="Connect" icon={Link}>
        <MenuItem onClick={onLinkNodes} disabled={!canLink} icon={Link}>
          Link Selected Nodes
        </MenuItem>
        <MenuItem onClick={onUnlinkNodes} disabled={!hasSelection} icon={Unlink}>
          Unlink Selected
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
        <MenuItem onClick={onTogglePropertiesPanel}>
          Toggle Properties Panel
        </MenuItem>
        <MenuItem onClick={onToggleStatsPanel}>
          Toggle Diagram Stats
        </MenuItem>
        {showMiniToggle && (
          <MenuItem onClick={onToggleMini}>
            Toggle Mini Editor
          </MenuItem>
        )}
        {showThemeToggle && (
          <MenuItem onClick={onToggleTheme}>
            Toggle Dark Mode
          </MenuItem>
        )}
      </MenuButton>

      <MenuButton name="Settings" icon={Settings}>
        <MenuItem onClick={() => { }}>
          Diagram Templates...
        </MenuItem>
        <MenuItem onClick={onValidateJSON}>
          JSON Schema Validator
        </MenuItem>
        <MenuItem separator />
        <MenuItem onClick={onAutoLayout}>
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

export default EnhancedMenuBar;