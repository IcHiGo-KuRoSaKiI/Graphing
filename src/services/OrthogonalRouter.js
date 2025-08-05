/**
 * OrthogonalRouter - Implements draw.io-style orthogonal routing
 * Handles direction-based routing patterns, collision avoidance, and smart pathfinding
 */

// Direction constants
const DIRECTIONS = {
  NORTH: 0,
  NORTHEAST: 1,
  EAST: 2,
  SOUTHEAST: 3,
  SOUTH: 4,
  SOUTHWEST: 5,
  WEST: 6,
  NORTHWEST: 7
};

// Route patterns for different direction combinations
const ROUTE_PATTERNS = {
  // North to South patterns
  [DIRECTIONS.NORTH]: {
    [DIRECTIONS.SOUTH]: ['vertical', 'horizontal'],
    [DIRECTIONS.SOUTHEAST]: ['vertical', 'horizontal'],
    [DIRECTIONS.SOUTHWEST]: ['vertical', 'horizontal'],
    [DIRECTIONS.EAST]: ['horizontal', 'vertical'],
    [DIRECTIONS.WEST]: ['horizontal', 'vertical'],
    [DIRECTIONS.NORTHEAST]: ['horizontal', 'vertical'],
    [DIRECTIONS.NORTHWEST]: ['horizontal', 'vertical']
  },
  // South to North patterns
  [DIRECTIONS.SOUTH]: {
    [DIRECTIONS.NORTH]: ['vertical', 'horizontal'],
    [DIRECTIONS.NORTHEAST]: ['vertical', 'horizontal'],
    [DIRECTIONS.NORTHWEST]: ['vertical', 'horizontal'],
    [DIRECTIONS.EAST]: ['horizontal', 'vertical'],
    [DIRECTIONS.WEST]: ['horizontal', 'vertical'],
    [DIRECTIONS.SOUTHEAST]: ['horizontal', 'vertical'],
    [DIRECTIONS.SOUTHWEST]: ['horizontal', 'vertical']
  },
  // East to West patterns
  [DIRECTIONS.EAST]: {
    [DIRECTIONS.WEST]: ['horizontal', 'vertical'],
    [DIRECTIONS.NORTHWEST]: ['horizontal', 'vertical'],
    [DIRECTIONS.SOUTHWEST]: ['horizontal', 'vertical'],
    [DIRECTIONS.NORTH]: ['vertical', 'horizontal'],
    [DIRECTIONS.SOUTH]: ['vertical', 'horizontal'],
    [DIRECTIONS.NORTHEAST]: ['vertical', 'horizontal'],
    [DIRECTIONS.SOUTHEAST]: ['vertical', 'horizontal']
  },
  // West to East patterns
  [DIRECTIONS.WEST]: {
    [DIRECTIONS.EAST]: ['horizontal', 'vertical'],
    [DIRECTIONS.NORTHEAST]: ['horizontal', 'vertical'],
    [DIRECTIONS.SOUTHEAST]: ['horizontal', 'vertical'],
    [DIRECTIONS.NORTH]: ['vertical', 'horizontal'],
    [DIRECTIONS.SOUTH]: ['vertical', 'horizontal'],
    [DIRECTIONS.NORTHWEST]: ['vertical', 'horizontal'],
    [DIRECTIONS.SOUTHWEST]: ['vertical', 'horizontal']
  }
};

class OrthogonalRouter {
  constructor(options = {}) {
    this.gridSize = options.gridSize || 20;
    this.minSpacing = options.minSpacing || 50;
    this.jettySize = options.jettySize || 10;
    this.obstacleMargin = options.obstacleMargin || 20;
  }

  /**
   * Calculate the optimal orthogonal route between two points
   */
  calculateRoute(source, target, obstacles = []) {
    const sourceDir = this.getDirectionFromPoint(source, target);
    const targetDir = this.getDirectionFromPoint(target, source);
    
    // Get routing pattern
    const pattern = this.getRoutePattern(sourceDir, targetDir);
    
    // Calculate connection points with jetties
    const sourceConnection = this.calculateConnectionPoint(source, sourceDir);
    const targetConnection = this.calculateConnectionPoint(target, targetDir);
    
    // Generate waypoints based on pattern
    const waypoints = this.generateWaypoints(sourceConnection, targetConnection, pattern);
    
    // Avoid obstacles
    const adjustedWaypoints = this.avoidObstacles(waypoints, obstacles);
    
    return {
      waypoints: adjustedWaypoints,
      pattern,
      sourceDirection: sourceDir,
      targetDirection: targetDir
    };
  }

  /**
   * Get direction from source to target
   */
  getDirectionFromPoint(source, target) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    
    // Calculate angle
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Convert to 8-directional
    if (angle >= -22.5 && angle < 22.5) return DIRECTIONS.EAST;
    if (angle >= 22.5 && angle < 67.5) return DIRECTIONS.SOUTHEAST;
    if (angle >= 67.5 && angle < 112.5) return DIRECTIONS.SOUTH;
    if (angle >= 112.5 && angle < 157.5) return DIRECTIONS.SOUTHWEST;
    if (angle >= 157.5 || angle < -157.5) return DIRECTIONS.WEST;
    if (angle >= -157.5 && angle < -112.5) return DIRECTIONS.NORTHWEST;
    if (angle >= -112.5 && angle < -67.5) return DIRECTIONS.NORTH;
    return DIRECTIONS.NORTHEAST;
  }

  /**
   * Get routing pattern for source-target direction combination
   */
  getRoutePattern(sourceDir, targetDir) {
    const patterns = ROUTE_PATTERNS[sourceDir];
    if (patterns && patterns[targetDir]) {
      return patterns[targetDir];
    }
    
    // Default pattern: horizontal then vertical
    return ['horizontal', 'vertical'];
  }

  /**
   * Calculate connection point with jetty
   */
  calculateConnectionPoint(node, direction) {
    const { x, y, width = 0, height = 0 } = node;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    let connectionPoint;
    
    switch (direction) {
      case DIRECTIONS.NORTH:
        connectionPoint = { x: centerX, y: y - this.jettySize };
        break;
      case DIRECTIONS.SOUTH:
        connectionPoint = { x: centerX, y: y + height + this.jettySize };
        break;
      case DIRECTIONS.EAST:
        connectionPoint = { x: x + width + this.jettySize, y: centerY };
        break;
      case DIRECTIONS.WEST:
        connectionPoint = { x: x - this.jettySize, y: centerY };
        break;
      case DIRECTIONS.NORTHEAST:
        connectionPoint = { x: x + width + this.jettySize, y: y - this.jettySize };
        break;
      case DIRECTIONS.NORTHWEST:
        connectionPoint = { x: x - this.jettySize, y: y - this.jettySize };
        break;
      case DIRECTIONS.SOUTHEAST:
        connectionPoint = { x: x + width + this.jettySize, y: y + height + this.jettySize };
        break;
      case DIRECTIONS.SOUTHWEST:
        connectionPoint = { x: x - this.jettySize, y: y + height + this.jettySize };
        break;
      default:
        connectionPoint = { x: centerX, y: centerY };
    }
    
    return connectionPoint;
  }

  /**
   * Generate waypoints based on routing pattern
   */
  generateWaypoints(source, target, pattern) {
    const waypoints = [];
    
    if (pattern.length === 1) {
      // Single segment - direct connection
      return waypoints;
    }
    
    if (pattern[0] === 'horizontal' && pattern[1] === 'vertical') {
      // L-shape: horizontal then vertical
      const midX = source.x + (target.x - source.x) / 2;
      waypoints.push({ x: midX, y: source.y });
      waypoints.push({ x: midX, y: target.y });
    } else if (pattern[0] === 'vertical' && pattern[1] === 'horizontal') {
      // L-shape: vertical then horizontal
      const midY = source.y + (target.y - source.y) / 2;
      waypoints.push({ x: source.x, y: midY });
      waypoints.push({ x: target.x, y: midY });
    } else if (pattern[0] === 'horizontal' && pattern[1] === 'horizontal') {
      // Z-shape: horizontal, vertical, horizontal
      const thirdX = source.x + (target.x - source.x) / 3;
      const twoThirdsX = source.x + 2 * (target.x - source.x) / 3;
      waypoints.push({ x: thirdX, y: source.y });
      waypoints.push({ x: thirdX, y: target.y });
      waypoints.push({ x: twoThirdsX, y: target.y });
    } else if (pattern[0] === 'vertical' && pattern[1] === 'vertical') {
      // Z-shape: vertical, horizontal, vertical
      const thirdY = source.y + (target.y - source.y) / 3;
      const twoThirdsY = source.y + 2 * (target.y - source.y) / 3;
      waypoints.push({ x: source.x, y: thirdY });
      waypoints.push({ x: target.x, y: thirdY });
      waypoints.push({ x: target.x, y: twoThirdsY });
    }
    
    return waypoints;
  }

  /**
   * Avoid obstacles by adjusting waypoints
   */
  avoidObstacles(waypoints, obstacles) {
    if (obstacles.length === 0) return waypoints;
    
    const adjustedWaypoints = [...waypoints];
    
    for (let i = 0; i < adjustedWaypoints.length; i++) {
      const waypoint = adjustedWaypoints[i];
      
      // Check for collisions with obstacles
      for (const obstacle of obstacles) {
        if (this.isPointInObstacle(waypoint, obstacle)) {
          // Move waypoint to avoid obstacle
          const adjustedPoint = this.findSafePoint(waypoint, obstacle);
          adjustedWaypoints[i] = adjustedPoint;
        }
      }
    }
    
    return adjustedWaypoints;
  }

  /**
   * Check if point is inside obstacle
   */
  isPointInObstacle(point, obstacle) {
    const { x, y, width = 0, height = 0 } = obstacle;
    const margin = this.obstacleMargin;
    
    return point.x >= x - margin &&
           point.x <= x + width + margin &&
           point.y >= y - margin &&
           point.y <= y + height + margin;
  }

  /**
   * Find safe point outside obstacle
   */
  findSafePoint(point, obstacle) {
    const { x, y, width = 0, height = 0 } = obstacle;
    const margin = this.obstacleMargin;
    
    // Try different directions to find safe point
    const directions = [
      { dx: margin, dy: 0 },   // Right
      { dx: -margin, dy: 0 },  // Left
      { dx: 0, dy: margin },    // Down
      { dx: 0, dy: -margin },   // Up
      { dx: margin, dy: margin }, // Diagonal
      { dx: -margin, dy: margin },
      { dx: margin, dy: -margin },
      { dx: -margin, dy: -margin }
    ];
    
    for (const dir of directions) {
      const safePoint = {
        x: point.x + dir.dx,
        y: point.y + dir.dy
      };
      
      if (!this.isPointInObstacle(safePoint, obstacle)) {
        return safePoint;
      }
    }
    
    // If no safe point found, return original point
    return point;
  }

  /**
   * Adjust path for obstacles during dragging
   */
  adjustPathForObstacles(waypoints, obstacles, segmentIndex, newPosition) {
    const adjustedWaypoints = [...waypoints];
    
    if (segmentIndex >= 0 && segmentIndex < adjustedWaypoints.length) {
      // Update the waypoint at segmentIndex
      adjustedWaypoints[segmentIndex] = newPosition;
      
      // Maintain orthogonality
      this.maintainOrthogonality(adjustedWaypoints, segmentIndex);
      
      // Avoid obstacles
      return this.avoidObstacles(adjustedWaypoints, obstacles);
    }
    
    return adjustedWaypoints;
  }

  /**
   * Maintain orthogonal constraints when dragging
   */
  maintainOrthogonality(waypoints, modifiedIndex) {
    if (waypoints.length === 0) return;
    
    const modifiedPoint = waypoints[modifiedIndex];
    
    // Adjust previous point if it exists
    if (modifiedIndex > 0) {
      const prevPoint = waypoints[modifiedIndex - 1];
      const isHorizontal = Math.abs(prevPoint.y - modifiedPoint.y) < 5;
      
      if (isHorizontal) {
        // Keep previous point at same Y level
        waypoints[modifiedIndex - 1] = { ...prevPoint, y: modifiedPoint.y };
      } else {
        // Keep previous point at same X level
        waypoints[modifiedIndex - 1] = { ...prevPoint, x: modifiedPoint.x };
      }
    }
    
    // Adjust next point if it exists
    if (modifiedIndex < waypoints.length - 1) {
      const nextPoint = waypoints[modifiedIndex + 1];
      const isHorizontal = Math.abs(modifiedPoint.y - nextPoint.y) < 5;
      
      if (isHorizontal) {
        // Keep next point at same Y level
        waypoints[modifiedIndex + 1] = { ...nextPoint, y: modifiedPoint.y };
      } else {
        // Keep next point at same X level
        waypoints[modifiedIndex + 1] = { ...nextPoint, x: modifiedPoint.x };
      }
    }
  }

  /**
   * Calculate optimal route with multiple options
   */
  calculateOptimalRoute(source, target, obstacles = []) {
    const routes = [];
    
    // Try different patterns
    const patterns = [
      ['horizontal', 'vertical'],
      ['vertical', 'horizontal'],
      ['horizontal', 'vertical', 'horizontal'],
      ['vertical', 'horizontal', 'vertical']
    ];
    
    for (const pattern of patterns) {
      const route = this.calculateRoute(source, target, obstacles);
      route.pattern = pattern;
      routes.push(route);
    }
    
    // Return the route with the least waypoints and shortest distance
    return routes.reduce((best, current) => {
      const bestScore = best.waypoints.length + this.calculateDistance(best.waypoints);
      const currentScore = current.waypoints.length + this.calculateDistance(current.waypoints);
      return currentScore < bestScore ? current : best;
    });
  }

  /**
   * Calculate total distance of waypoints
   */
  calculateDistance(waypoints) {
    if (waypoints.length === 0) return 0;
    
    let distance = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const dx = waypoints[i].x - waypoints[i - 1].x;
      const dy = waypoints[i].y - waypoints[i - 1].y;
      distance += Math.sqrt(dx * dx + dy * dy);
    }
    
    return distance;
  }
}

export default OrthogonalRouter; 