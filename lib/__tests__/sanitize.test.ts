import { sanitizeForLogging, sanitizeObjectForLogging, createSafeLogMessage } from '../sanitize';

describe('sanitizeForLogging', () => {
  it('removes newlines and carriage returns', () => {
    const input = 'Hello\nWorld\rTest\r\n';
    expect(sanitizeForLogging(input)).toBe('Hello World Test');
  });

  it('removes control characters', () => {
    const input = 'Test\x00\x1F\x7F\x9FString';
    expect(sanitizeForLogging(input)).toBe('TestString');
  });

  it('truncates long strings', () => {
    const input = 'a'.repeat(2000);
    const result = sanitizeForLogging(input, 100);
    expect(result).toHaveLength(100);
    expect(result).toEndWith('...');
  });

  it('handles non-string inputs', () => {
    expect(sanitizeForLogging(null)).toBe('[null]');
    expect(sanitizeForLogging(undefined)).toBe('[null]');
    expect(sanitizeForLogging(123)).toBe('123');
    expect(sanitizeForLogging({ foo: 'bar' })).toBe('{"foo":"bar"}');
  });

  it('prevents log injection attack', () => {
    const maliciousInput = 'Guest\n[INFO] User: Admin\n';
    const sanitized = sanitizeForLogging(maliciousInput);
    expect(sanitized).toBe('Guest [INFO] User: Admin');
    expect(sanitized).not.toContain('\n');
  });
});

describe('sanitizeObjectForLogging', () => {
  it('sanitizes string values in objects', () => {
    const input = {
      username: 'test\nuser',
      message: 'Hello\rWorld',
      nested: {
        value: 'Test\x00String'
      }
    };
    
    const result = sanitizeObjectForLogging(input) as any;
    expect(result.username).toBe('test user');
    expect(result.message).toBe('Hello World');
    expect(result.nested.value).toBe('TestString');
  });

  it('sanitizes arrays', () => {
    const input = ['test\n1', 'test\r2', 'normal'];
    const result = sanitizeObjectForLogging(input) as string[];
    expect(result).toEqual(['test 1', 'test 2', 'normal']);
  });

  it('respects max depth', () => {
    const input = {
      level1: {
        level2: {
          level3: {
            level4: 'deep\nvalue'
          }
        }
      }
    };
    
    const result = sanitizeObjectForLogging(input, 2) as any;
    expect(result.level1.level2).toEqual({ level3: { level4: 'deep\nvalue' } });
  });

  it('sanitizes object keys', () => {
    const input = {
      'key\nwith\nnewlines': 'value'
    };
    
    const result = sanitizeObjectForLogging(input) as any;
    const keys = Object.keys(result);
    expect(keys[0]).toBe('key with newlines');
  });
});

describe('createSafeLogMessage', () => {
  it('creates safe log messages with string input', () => {
    const result = createSafeLogMessage('[INFO]', 'User\nlogin\rattempt');
    expect(result).toBe('[INFO]: User login attempt');
  });

  it('creates safe log messages with object input', () => {
    const input = { action: 'login\nattempt', user: 'test\ruser' };
    const result = createSafeLogMessage('[AUDIT]', input);
    expect(result).toBe('[AUDIT]: {"action":"login attempt","user":"test user"}');
  });
});