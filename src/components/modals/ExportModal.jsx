import React, { useState, useCallback, useMemo } from 'react';
import { X, Download, Settings, Image, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { ExportService } from '../../services/ExportService';

const ExportModal = ({ isOpen, onClose, diagramData, className = '' }) => {
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [quality, setQuality] = useState(0.9);
  const [scale, setScale] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [includeBackground, setIncludeBackground] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const exportService = useMemo(() => new ExportService(), []);

  // Get format information
  const formatInfo = useMemo(() => {
    return exportService.getFormatInfo(selectedFormat) || {};
  }, [selectedFormat, exportService]);

  // Available formats
  const availableFormats = useMemo(() => {
    return exportService.getAvailableFormats().map(format => ({
      id: format,
      ...exportService.getFormatInfo(format)
    }));
  }, [exportService]);

  // Handle format change
  const handleFormatChange = useCallback((format) => {
    setSelectedFormat(format);
    setExportError(null);
    setExportSuccess(false);
    
    // Reset quality and background options based on format
    const info = exportService.getFormatInfo(format);
    if (info) {
      if (info.qualityRange) {
        setQuality(info.qualityRange.default);
      }
      if (!info.supportsTransparency) {
        setIncludeBackground(true);
      }
    }
  }, [exportService]);

  // Handle export
  const handleExport = useCallback(async () => {
    if (!diagramData) {
      setExportError('No diagram data available for export');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);
    setExportSuccess(false);

    try {
      // Validate options
      const validatedOptions = exportService.validateExportOptions(selectedFormat, {
        quality,
        scale,
        backgroundColor,
        includeBackground
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Perform export
      const result = await exportService.export(diagramData, selectedFormat, validatedOptions);

      clearInterval(progressInterval);
      setExportProgress(100);

      if (result.success) {
        // Create download link
        exportService.createDownloadLink(result.data);
        setExportSuccess(true);
        
        // Auto-close after success
        setTimeout(() => {
          onClose();
          setExportSuccess(false);
        }, 2000);
      } else {
        setExportError(result.error || 'Export failed');
      }
    } catch (error) {
      setExportError(error.message || 'Export failed');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [diagramData, selectedFormat, quality, scale, backgroundColor, includeBackground, exportService, onClose]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!isExporting) {
      onClose();
      setExportError(null);
      setExportSuccess(false);
      setExportProgress(0);
    }
  }, [isExporting, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Export Diagram
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => handleFormatChange(format.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedFormat === format.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {format.id === 'png' && <Image className="w-4 h-4" />}
                    {format.id === 'jpg' && <Image className="w-4 h-4" />}
                    {format.id === 'svg' && <FileText className="w-4 h-4" />}
                    {format.id === 'json' && <FileText className="w-4 h-4" />}
                    {format.id === 'drawio' && <FileText className="w-4 h-4" />}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {format.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Settings */}
          {formatInfo.qualityRange && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quality ({Math.round(quality * 100)}%)
              </label>
              <input
                type="range"
                min={formatInfo.qualityRange.min}
                max={formatInfo.qualityRange.max}
                step={0.1}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{Math.round(formatInfo.qualityRange.min * 100)}%</span>
                <span>{Math.round(formatInfo.qualityRange.max * 100)}%</span>
              </div>
            </div>
          )}

          {/* Scale Settings */}
          {formatInfo.scaleRange && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resolution Scale ({scale}x)
              </label>
              <div className="flex gap-2">
                {[0.5, 1, 2, 3].map((scaleOption) => (
                  <button
                    key={scaleOption}
                    onClick={() => setScale(scaleOption)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      scale === scaleOption
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    {scaleOption}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Background Settings */}
          {formatInfo.supportsTransparency && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={includeBackground}
                  onChange={(e) => setIncludeBackground(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Include Background
              </label>
              {includeBackground && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {exportError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300">
                {exportError}
              </span>
            </div>
          )}

          {/* Success Message */}
          {exportSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Export completed successfully!
              </span>
            </div>
          )}

          {/* Progress Bar */}
          {isExporting && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Exporting...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || !diagramData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
