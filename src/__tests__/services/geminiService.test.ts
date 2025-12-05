/**
 * Gemini Service Tests
 * TC-ANALYTICS-003, TC-ANALYTICS-004, TC-ANALYTICS-005
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateCoachInsight } from '../../../services/geminiService';
import { AttendanceRecord } from '../../../types';

// Create mock functions
const mockGenerateContent = vi.fn();

// Mock the GoogleGenAI module - define class inside factory to avoid hoisting issues
vi.mock('@google/genai', () => {
  const mockGenerateContentFn = vi.fn();
  
  class MockGoogleGenAI {
    models: {
      generateContent: typeof mockGenerateContentFn;
    };

    constructor(options: { apiKey: string }) {
      this.models = {
        generateContent: mockGenerateContentFn,
      };
    }
  }

  return {
    GoogleGenAI: MockGoogleGenAI,
    __mockGenerateContent: mockGenerateContentFn, // Export for test access
  };
});

describe('GeminiService', () => {
  let mockGenerateContentFn: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Get the mocked function from the module
    const mockedModule = await import('@google/genai');
    mockGenerateContentFn = (mockedModule as any).__mockGenerateContent;
    mockGenerateContentFn.mockReset();
    
    // Reset env
    delete process.env.API_KEY;
    delete process.env.GEMINI_API_KEY;
  });

  describe('TC-ANALYTICS-004: Get AI Insight - No Data', () => {
    it('should return message when no attendance data', async () => {
      // Set API key so it tries to use AI
      process.env.API_KEY = 'test-key';
      
      // Mock successful response with text property
      mockGenerateContentFn.mockResolvedValue({
        text: 'Test response',
      });

      const result = await generateCoachInsight([]);
      
      // When no data but API key exists, it should return "Start logging"
      expect(result).toContain('Start logging');
      expect(result).toBeTruthy();
    });
  });

  describe('TC-ANALYTICS-005: Get AI Insight - API Error', () => {
    it('should handle API errors gracefully', async () => {
      // Set API key to trigger API call attempt
      process.env.API_KEY = 'test-key';
      
      // Mock API to throw error
      mockGenerateContentFn.mockRejectedValue(new Error('Network error'));

      const result = await generateCoachInsight([
        {
          id: '1',
          date: '2024-01-15',
          attended: true,
          timestamp: Date.now(),
        },
      ]);

      // Should return fallback message, not throw
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('Great job logging');
    });
  });

  describe('TC-ANALYTICS-006: AI Insight - Timeout Handling', () => {
    it('should handle timeout errors', async () => {
      process.env.API_KEY = 'test-key';
      
      // Mock timeout
      mockGenerateContentFn.mockImplementation(
        () => new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100);
        })
      );

      const result = await generateCoachInsight([
        {
          id: '1',
          date: '2024-01-15',
          attended: true,
          timestamp: Date.now(),
        },
      ]);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('Great job logging');
    });
  });
});

