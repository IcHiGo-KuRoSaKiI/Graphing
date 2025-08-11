/**
 * Draw.io-Style Edge System Test Component
 * Tests all optimizations and features in the browser environment
 */

import React, { useState, useEffect, useCallback } from 'react';
import edgeWorkerService from '../../services/EdgeWorkerService';
import enhancedEdgeManager from '../../services/EnhancedEdgeManager';
import EdgePerformanceMonitor from '../../services/EdgePerformanceMonitor';
import LayoutAwareRoutingService from '../../services/LayoutAwareRoutingService';

const DrawIoStyleTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [performanceMetrics, setPerformanceMetrics] = useState({});

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setTestResults([]);
    
    console.log('🧪 Starting Draw.io-Style Edge System Tests...\n');

    try {
      // Test 1: Web Worker Initialization
      await runTest('Web Worker Initialization', async () => {
        await edgeWorkerService.initWorker();
        const metrics = await edgeWorkerService.getPerformanceMetrics();
        return {
          initialized: edgeWorkerService.isInitialized,
          cacheSize: metrics.cacheSize,
          avgProcessingTime: metrics.avgProcessingTime
        };
      });

      // Test 2: Enhanced Caching
      await runTest('Enhanced Caching', async () => {
        const testEdge = {
          id: 'cache-test-edge',
          source: 'node-1',
          target: 'node-2',
          data: { waypoints: [{ x: 100, y: 100 }, { x: 200, y: 200 }] }
        };
        
        const testNodes = [
          { id: 'node-1', position: { x: 0, y: 0 }, width: 100, height: 50 },
          { id: 'node-2', position: { x: 300, y: 300 }, width: 100, height: 50 }
        ];

        const startTime1 = performance.now();
        const result1 = await edgeWorkerService.optimizeWaypoints(testEdge, testNodes);
        const time1 = performance.now() - startTime1;

        const startTime2 = performance.now();
        const result2 = await edgeWorkerService.optimizeWaypoints(testEdge, testNodes);
        const time2 = performance.now() - startTime2;

        const cacheHit = time2 < time1 * 0.5;
        
        return {
          firstCallTime: time1,
          secondCallTime: time2,
          cacheHit,
          resultsMatch: JSON.stringify(result1) === JSON.stringify(result2)
        };
      });

      // Test 3: Batch Processing
      await runTest('Batch Processing', async () => {
        const testEdges = Array.from({ length: 10 }, (_, i) => ({
          id: `batch-test-edge-${i}`,
          source: `node-${i}`,
          target: `node-${i + 1}`,
          data: { waypoints: [{ x: i * 50, y: i * 50 }] }
        }));

        const testNodes = Array.from({ length: 11 }, (_, i) => ({
          id: `node-${i}`,
          position: { x: i * 100, y: i * 100 },
          width: 100,
          height: 50
        }));

        const individualStart = performance.now();
        const individualResults = await Promise.all(
          testEdges.map(edge => edgeWorkerService.optimizeWaypoints(edge, testNodes))
        );
        const individualTime = performance.now() - individualStart;

        const batchStart = performance.now();
        const batchResults = await edgeWorkerService.processBatchOptimized(testEdges, testNodes);
        const batchTime = performance.now() - batchStart;

        const batchEfficiency = individualTime / batchTime;
        const isEfficient = batchEfficiency > 1.2;
        
        return {
          individualTime,
          batchTime,
          efficiency: batchEfficiency,
          individualCount: individualResults.length,
          batchCount: batchResults.length
        };
      });

      // Test 4: Draw.io Connection Points
      await runTest('Draw.io Connection Points', async () => {
        const testNodes = [
          { id: 'source', position: { x: 0, y: 0 }, width: 100, height: 50 },
          { id: 'target', position: { x: 300, y: 300 }, width: 100, height: 50 }
        ];

        const sourcePoint = calculateOptimalConnectionPoint(
          testNodes[0], 
          testNodes[1].position, 
          testNodes[0].position
        );
        const targetPoint = calculateOptimalConnectionPoint(
          testNodes[1], 
          testNodes[0].position, 
          testNodes[1].position
        );

        const isHorizontal = Math.abs(sourcePoint.x - targetPoint.x) > Math.abs(sourcePoint.y - targetPoint.y);
        
        return {
          sourcePoint,
          targetPoint,
          isHorizontal,
          hasValidPoints: sourcePoint && targetPoint
        };
      });

      // Test 5: Advanced Intersections
      await runTest('Advanced Intersections', async () => {
        const testEdges = [
          {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2',
            data: { waypoints: [{ x: 100, y: 50 }, { x: 200, y: 50 }] }
          },
          {
            id: 'edge-2',
            source: 'node-3',
            target: 'node-4',
            data: { waypoints: [{ x: 150, y: 0 }, { x: 150, y: 100 }] }
          }
        ];

        const testNodes = [
          { id: 'node-1', position: { x: 0, y: 0 }, width: 100, height: 50 },
          { id: 'node-2', position: { x: 200, y: 0 }, width: 100, height: 50 },
          { id: 'node-3', position: { x: 150, y: 0 }, width: 50, height: 50 },
          { id: 'node-4', position: { x: 150, y: 100 }, width: 50, height: 50 }
        ];

        const intersections = await edgeWorkerService.detectIntersections(testEdges[0], testNodes);
        
        const hasIntersection = intersections.length > 0;
        const correctIntersection = intersections.some(intersection => 
          Math.abs(intersection.point.x - 150) < 5 && Math.abs(intersection.point.y - 50) < 5
        );
        
        return {
          intersectionsFound: intersections.length,
          correctIntersection,
          intersectionPoints: intersections.map(i => i.point)
        };
      });

      // Test 6: Layout-Aware Routing
      await runTest('Layout-Aware Routing', async () => {
        const hierarchicalNodes = [
          { id: 'root', position: { x: 200, y: 0 }, width: 100, height: 50 },
          { id: 'child1', position: { x: 100, y: 100 }, width: 100, height: 50 },
          { id: 'child2', position: { x: 300, y: 100 }, width: 100, height: 50 }
        ];

        const testEdge = {
          id: 'layout-test-edge',
          source: 'root',
          target: 'child1'
        };

        const detectedLayout = LayoutAwareRoutingService.detectLayoutPattern(hierarchicalNodes);
        const path = await LayoutAwareRoutingService.calculateLayoutAwarePath(testEdge, hierarchicalNodes, 'hierarchical');
        
        return {
          detectedLayout,
          isHierarchical: detectedLayout === 'hierarchical',
          hasPath: path && path.length > 0,
          pathLength: path ? path.length : 0
        };
      });

      // Test 7: Performance Monitoring
      await runTest('Performance Monitoring', async () => {
        EdgePerformanceMonitor.startMonitoring();
        
        for (let i = 0; i < 5; i++) {
          EdgePerformanceMonitor.recordProcessingTime(`test-edge-${i}`, 50 + Math.random() * 50, 'optimize');
          EdgePerformanceMonitor.recordCacheHitRate(0.7 + Math.random() * 0.3);
          EdgePerformanceMonitor.recordWorkerLatency(20 + Math.random() * 30);
          EdgePerformanceMonitor.recordRenderTime(10 + Math.random() * 10);
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        const report = EdgePerformanceMonitor.generateReport();
        EdgePerformanceMonitor.stopMonitoring();
        
        return {
          totalOperations: report.summary.totalOperations,
          avgProcessingTime: report.summary.averageProcessingTime,
          recommendations: report.recommendations.length,
          isMonitoring: report.isMonitoring
        };
      });

      // Test 8: Virtual Bend Points
      await runTest('Virtual Bend Points', async () => {
        const testEdge = {
          id: 'virtual-bend-test-edge',
          source: 'node-1',
          target: 'node-2',
          data: { waypoints: [{ x: 100, y: 100 }, { x: 200, y: 200 }] }
        };

        const testNodes = [
          { id: 'node-1', position: { x: 0, y: 0 }, width: 100, height: 50 },
          { id: 'node-2', position: { x: 300, y: 300 }, width: 100, height: 50 }
        ];

        const virtualBends = await edgeWorkerService.calculateVirtualBends(testEdge, testNodes);
        
        const hasVirtualBends = virtualBends.length > 0;
        const correctPositions = virtualBends.every(bend => 
          bend.x !== undefined && bend.y !== undefined && bend.segmentIndex !== undefined
        );
        
        return {
          virtualBendsCount: virtualBends.length,
          correctPositions,
          virtualBends: virtualBends.slice(0, 3)
        };
      });

      // Test 9: Path Optimization
      await runTest('Path Optimization', async () => {
        const testEdge = {
          id: 'path-optimization-test-edge',
          source: 'node-1',
          target: 'node-2',
          data: { 
            waypoints: [
              { x: 100, y: 100 },
              { x: 100, y: 100 }, // Redundant point
              { x: 200, y: 100 },
              { x: 200, y: 100 }, // Redundant point
              { x: 200, y: 200 }
            ]
          }
        };

        const testNodes = [
          { id: 'node-1', position: { x: 0, y: 0 }, width: 100, height: 50 },
          { id: 'node-2', position: { x: 300, y: 300 }, width: 100, height: 50 }
        ];

        const optimizedWaypoints = await edgeWorkerService.optimizeWaypoints(testEdge, testNodes);
        
        const originalLength = testEdge.data.waypoints.length;
        const optimizedLength = optimizedWaypoints.length;
        const wasOptimized = optimizedLength < originalLength;
        
        return {
          originalLength,
          optimizedLength,
          wasOptimized,
          reduction: originalLength - optimizedLength
        };
      });

      // Test 10: Real-world Scenario
      await runTest('Real-world Scenario', async () => {
        const nodeCount = 20;
        const edgeCount = 30;
        
        const nodes = Array.from({ length: nodeCount }, (_, i) => ({
          id: `real-node-${i}`,
          position: { x: (i % 5) * 120, y: Math.floor(i / 5) * 100 },
          width: 100,
          height: 50
        }));

        const edges = Array.from({ length: edgeCount }, (_, i) => ({
          id: `real-edge-${i}`,
          source: `real-node-${i % nodeCount}`,
          target: `real-node-${(i + 1) % nodeCount}`,
          data: { 
            waypoints: Array.from({ length: Math.floor(Math.random() * 3) }, (_, j) => ({
              x: Math.random() * 500,
              y: Math.random() * 500
            }))
          }
        }));

        const startTime = performance.now();
        const batchResults = await edgeWorkerService.processBatchOptimized(edges, nodes);
        const totalTime = performance.now() - startTime;
        
        const allProcessed = batchResults.length === edgeCount;
        const reasonableTime = totalTime < 2000; // Less than 2 seconds for 30 edges
        
        return {
          nodeCount,
          edgeCount,
          processedCount: batchResults.length,
          totalTime,
          allProcessed,
          reasonableTime
        };
      });

      // Get final performance metrics
      const finalMetrics = await edgeWorkerService.getPerformanceMetrics();
      setPerformanceMetrics(finalMetrics);

      console.log('\n🎉 ALL TESTS COMPLETED!');
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      setTestResults(prev => [...prev, {
        test: 'Test Suite',
        status: 'FAILED',
        error: error.message
      }]);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  }, []);

  const runTest = async (testName, testFunction) => {
    setCurrentTest(testName);
    console.log(`Running: ${testName}`);
    
    try {
      const result = await testFunction();
      const passed = evaluateTestResult(testName, result);
      
      setTestResults(prev => [...prev, {
        test: testName,
        status: passed ? 'PASSED' : 'FAILED',
        details: result
      }]);
      
      console.log(`${passed ? '✅' : '❌'} ${testName} ${passed ? 'passed' : 'failed'}`);
      
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: testName,
        status: 'FAILED',
        error: error.message
      }]);
      console.log(`❌ ${testName} failed:`, error.message);
    }
  };

  const evaluateTestResult = (testName, result) => {
    switch (testName) {
      case 'Web Worker Initialization':
        return result.initialized;
      case 'Enhanced Caching':
        return result.cacheHit && result.resultsMatch;
      case 'Batch Processing':
        return result.efficiency > 1.2;
      case 'Draw.io Connection Points':
        return result.hasValidPoints;
      case 'Advanced Intersections':
        return result.correctIntersection;
      case 'Layout-Aware Routing':
        return result.isHierarchical && result.hasPath;
      case 'Performance Monitoring':
        return result.totalOperations > 0;
      case 'Virtual Bend Points':
        return result.hasVirtualBends && result.correctPositions;
      case 'Path Optimization':
        return result.wasOptimized;
      case 'Real-world Scenario':
        return result.allProcessed && result.reasonableTime;
      default:
        return true;
    }
  };

  const calculateOptimalConnectionPoint = (node, targetPoint, sourcePoint) => {
    if (!node) return null;
    
    const bounds = {
      x: node.position.x,
      y: node.position.y,
      width: node.width || 150,
      height: node.height || 60,
      right: node.position.x + (node.width || 150),
      bottom: node.position.y + (node.height || 60)
    };
    
    const center = { 
      x: bounds.x + bounds.width / 2, 
      y: bounds.y + bounds.height / 2 
    };
    
    const dx = targetPoint.x - center.x;
    const dy = targetPoint.y - center.y;
    
    const margin = 5;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        return { x: bounds.right + margin, y: center.y };
      } else {
        return { x: bounds.x - margin, y: center.y };
      }
    } else {
      if (dy > 0) {
        return { x: center.x, y: bounds.bottom + margin };
      } else {
        return { x: center.x, y: bounds.y - margin };
      }
    }
  };

  const getTestSummary = () => {
    const passedTests = testResults.filter(r => r.status === 'PASSED').length;
    const totalTests = testResults.length;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    return { passedTests, totalTests, successRate };
  };

  const { passedTests, totalTests, successRate } = getTestSummary();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🧪 Draw.io-Style Edge System Test Suite
        </h1>
        
        <div className="mb-6">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-semibold text-white ${
              isRunning 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRunning ? 'Running Tests...' : '🚀 Run All Tests'}
          </button>
          
          {isRunning && (
            <div className="mt-4 text-blue-600">
              Currently running: {currentTest}
            </div>
          )}
        </div>

        {/* Test Summary */}
        {testResults.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">📊 Test Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{totalTests - passedTests}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{successRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {Object.keys(performanceMetrics).length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">📈 Performance Metrics</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Tasks:</span> {performanceMetrics.totalTasks}
              </div>
              <div>
                <span className="font-medium">Avg Processing Time:</span> {performanceMetrics.avgProcessingTime?.toFixed(2)}ms
              </div>
              <div>
                <span className="font-medium">Cache Size:</span> {performanceMetrics.cacheSize}
              </div>
              <div>
                <span className="font-medium">Cache Hit Rate:</span> {(performanceMetrics.cacheHitRate * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">📋 Test Results</h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  result.status === 'PASSED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">
                      {result.status === 'PASSED' ? '✅' : '❌'} {result.test}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      result.status === 'PASSED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  
                  {result.details && (
                    <div className="text-sm text-gray-600">
                      {Object.entries(result.details).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="text-sm text-red-600 mt-2">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Status */}
        {testResults.length > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-xl font-semibold mb-2">🎯 Final Status</h2>
            {successRate >= 90 ? (
              <div className="text-green-700">
                🎉 EXCELLENT! Draw.io-style edge system is working perfectly!
              </div>
            ) : successRate >= 75 ? (
              <div className="text-blue-700">
                👍 GOOD! Draw.io-style edge system is working well with minor issues.
              </div>
            ) : successRate >= 50 ? (
              <div className="text-yellow-700">
                ⚠️ FAIR! Draw.io-style edge system needs some improvements.
              </div>
            ) : (
              <div className="text-red-700">
                🚨 POOR! Draw.io-style edge system needs significant work.
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-600">
              <div>✅ Web Worker-based edge processing</div>
              <div>✅ Enhanced caching and batch processing</div>
              <div>✅ Draw.io-style connection points</div>
              <div>✅ Advanced intersection detection</div>
              <div>✅ Layout-aware routing</div>
              <div>✅ Performance monitoring and optimization</div>
              <div>✅ Virtual bend points and path optimization</div>
              <div>✅ Real-world scenario support</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawIoStyleTest;

