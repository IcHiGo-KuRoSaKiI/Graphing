import { 
  SHAPE_DEFINITIONS, 
  SHAPE_CATEGORIES, 
  getShapeDefinition, 
  getShapesByCategory, 
  searchShapes 
} from '../ShapeDefinitions';

describe('ShapeDefinitions', () => {
  test('should have valid shape definitions', () => {
    expect(SHAPE_DEFINITIONS).toBeDefined();
    expect(Object.keys(SHAPE_DEFINITIONS).length).toBeGreaterThan(0);
    
    // Test a specific shape
    const rectShape = SHAPE_DEFINITIONS['basic-rectangle'];
    expect(rectShape).toBeDefined();
    expect(rectShape.name).toBe('Rectangle');
    expect(rectShape.category).toBe('basic');
    expect(rectShape.defaultSize).toHaveProperty('width');
    expect(rectShape.defaultSize).toHaveProperty('height');
  });

  test('should have valid categories', () => {
    expect(SHAPE_CATEGORIES).toBeDefined();
    expect(SHAPE_CATEGORIES.basic).toBeDefined();
    expect(SHAPE_CATEGORIES.basic.name).toBe('Basic Shapes');
    expect(Array.isArray(SHAPE_CATEGORIES.basic.shapes)).toBe(true);
  });

  test('getShapeDefinition should work correctly', () => {
    const shape = getShapeDefinition('basic-rectangle');
    expect(shape).toBeDefined();
    expect(shape.id).toBe('basic-rectangle');
    
    const invalidShape = getShapeDefinition('invalid-shape');
    expect(invalidShape).toBeNull();
  });

  test('getShapesByCategory should work correctly', () => {
    const basicShapes = getShapesByCategory('basic');
    expect(Array.isArray(basicShapes)).toBe(true);
    expect(basicShapes.length).toBeGreaterThan(0);
    
    const invalidCategory = getShapesByCategory('invalid');
    expect(invalidCategory).toEqual([]);
  });

  test('searchShapes should work correctly', () => {
    const rectangleShapes = searchShapes('rectangle');
    expect(Array.isArray(rectangleShapes)).toBe(true);
    expect(rectangleShapes.length).toBeGreaterThan(0);
    
    const allShapes = searchShapes('');
    expect(allShapes.length).toBe(Object.keys(SHAPE_DEFINITIONS).length);
  });
});