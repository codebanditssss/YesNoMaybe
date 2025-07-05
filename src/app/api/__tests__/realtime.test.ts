import { NextRequest } from 'next/server';
import { GET, OPTIONS } from '../realtime/route';
import { realtimeListener } from '@/lib/realtime-listener';

// Mock the realtime listener
jest.mock('@/lib/realtime-listener', () => ({
  realtimeListener: {
    subscribeAll: jest.fn()
  }
}));

const mockRealtimeListener = realtimeListener as jest.Mocked<typeof realtimeListener>;

// Helper to create a mock request
function createMockRequest(headers: Record<string, string> = {}) {
  const request = {
    headers: {
      get: jest.fn((key: string) => headers[key] || null)
    }
  } as unknown as NextRequest;
  
  return request;
}

// Helper to read from ReadableStream
async function readStreamToEnd(stream: ReadableStream): Promise<string[]> {
  const reader = stream.getReader();
  const chunks: string[] = [];
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = new TextDecoder().decode(value);
      chunks.push(chunk);
    }
  } catch (error) {
    // Stream was cancelled or errored
  }
  
  return chunks;
}

describe('/api/realtime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('GET handler', () => {
    it('should reject requests without SSE accept header', async () => {
      const request = createMockRequest({});
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('SSE not supported');
    });

    it('should accept requests with proper SSE accept header', async () => {
      const request = createMockRequest({
        'accept': 'text/event-stream'
      });
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
      expect(response.headers.get('Connection')).toBe('keep-alive');
    });

    it('should send initial connection event', async () => {
      const request = createMockRequest({
        'accept': 'text/event-stream'
      });
      
      const response = await GET(request);
      const stream = response.body!;
      
      // Read the initial chunk
      const reader = stream.getReader();
      const { value } = await reader.read();
      const chunk = new TextDecoder().decode(value);
      
      expect(chunk).toContain('data: ');
      
      const dataLine = chunk.split('\n').find(line => line.startsWith('data: '));
      const data = JSON.parse(dataLine!.substring(6));
      
      expect(data.type).toBe('connection');
      expect(data.message).toBe('Connected to realtime updates');
      expect(data.timestamp).toBeDefined();
      
      // Cancel the stream
      reader.cancel();
    });

    it('should subscribe to realtime events', async () => {
      const request = createMockRequest({
        'accept': 'text/event-stream'
      });
      
      const response = await GET(request);
      const stream = response.body!;
      
      expect(mockRealtimeListener.subscribeAll).toHaveBeenCalled();
      
      // Get the subscription callback
      const subscriptionCallback = mockRealtimeListener.subscribeAll.mock.calls[0][0];
      expect(subscriptionCallback).toBeInstanceOf(Function);
      
      // Cancel the stream
      const reader = stream.getReader();
      reader.cancel();
    });

    it('should broadcast database events to SSE stream', async () => {
      const request = createMockRequest({
        'accept': 'text/event-stream'
      });
      
      const response = await GET(request);
      const stream = response.body!;
      
      // Get the subscription callback
      const subscriptionCallback = mockRealtimeListener.subscribeAll.mock.calls[0][0];
      
      // Start reading the stream
      const reader = stream.getReader();
      
      // Skip the initial connection event
      await reader.read();
      
      // Simulate a database event
      const mockEvent = {
        channel: 'orders',
        event: {
          operation: 'INSERT' as const,
          table: 'orders',
          new: { id: 'order-123', status: 'pending' },
          old: null,
          timestamp: new Date().toISOString()
        }
      };
      
      subscriptionCallback(mockEvent);
      
      // Read the broadcasted event
      const { value } = await reader.read();
      const chunk = new TextDecoder().decode(value);
      
      expect(chunk).toContain('data: ');
      
      const dataLine = chunk.split('\n').find(line => line.startsWith('data: '));
      const data = JSON.parse(dataLine!.substring(6));
      
      expect(data.type).toBe('database_change');
      expect(data.channel).toBe('orders');
      expect(data.operation).toBe('INSERT');
      expect(data.table).toBe('orders');
      expect(data.data).toEqual({ id: 'order-123', status: 'pending' });
      
      // Cancel the stream
      reader.cancel();
    });

    it('should handle UPDATE events with old and new data', async () => {
      const request = createMockRequest({
        'accept': 'text/event-stream'
      });
      
      const response = await GET(request);
      const stream = response.body!;
      
      const subscriptionCallback = mockRealtimeListener.subscribeAll.mock.calls[0][0];
      const reader = stream.getReader();
      
      // Skip initial connection event
      await reader.read();
      
      // Simulate UPDATE event
      const mockEvent = {
        channel: 'orders',
        event: {
          operation: 'UPDATE' as const,
          table: 'orders',
          new: { id: 'order-123', status: 'filled' },
          old: { id: 'order-123', status: 'pending' },
          timestamp: new Date().toISOString()
        }
      };
      
      subscriptionCallback(mockEvent);
      
      const { value } = await reader.read();
      const chunk = new TextDecoder().decode(value);
      const dataLine = chunk.split('\n').find(line => line.startsWith('data: '));
      const data = JSON.parse(dataLine!.substring(6));
      
      expect(data.data).toEqual({ id: 'order-123', status: 'filled' });
      
      reader.cancel();
    });

    it('should handle DELETE events with old data', async () => {
      const request = createMockRequest({
        'accept': 'text/event-stream'
      });
      
      const response = await GET(request);
      const stream = response.body!;
      
      const subscriptionCallback = mockRealtimeListener.subscribeAll.mock.calls[0][0];
      const reader = stream.getReader();
      
      // Skip initial connection event
      await reader.read();
      
      // Simulate DELETE event
      const mockEvent = {
        channel: 'orders',
        event: {
          operation: 'DELETE' as const,
          table: 'orders',
          new: null,
          old: { id: 'order-123', status: 'cancelled' },
          timestamp: new Date().toISOString()
        }
      };
      
      subscriptionCallback(mockEvent);
      
      const { value } = await reader.read();
      const chunk = new TextDecoder().decode(value);
      const dataLine = chunk.split('\n').find(line => line.startsWith('data: '));
      const data = JSON.parse(dataLine!.substring(6));
      
      expect(data.data).toEqual({ id: 'order-123', status: 'cancelled' });
      
      reader.cancel();
    });

    it('should handle invalid event data gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const request = createMockRequest({
        'accept': 'text/event-stream'
      });
      
      const response = await GET(request);
      const stream = response.body!;
      
      const subscriptionCallback = mockRealtimeListener.subscribeAll.mock.calls[0][0];
      const reader = stream.getReader();
      
      // Skip initial connection event
      await reader.read();
      
      // Simulate invalid event that would cause JSON.stringify to fail
      const mockEvent = {
        channel: 'test',
        event: {
          operation: 'INSERT' as const,
          table: 'test',
          new: { circular: {} },
          old: null,
          timestamp: new Date().toISOString()
        }
      };
      
      // Create circular reference
      (mockEvent.event.new as any).circular.ref = mockEvent.event.new;
      
      subscriptionCallback(mockEvent);
      
      expect(consoleSpy).toHaveBeenCalledWith('❌ Error sending SSE event:', expect.any(Error));
      
      reader.cancel();
      consoleSpy.mockRestore();
    });

    it('should send heartbeat events periodically', async () => {
      jest.useFakeTimers();
      
      const request = createMockRequest({
        'accept': 'text/event-stream'
      });
      
      const response = await GET(request);
      const stream = response.body!;
      const reader = stream.getReader();
      
      // Skip initial connection event
      await reader.read();
      
      // Fast forward 30 seconds to trigger heartbeat
      jest.advanceTimersByTime(30000);
      
      const { value } = await reader.read();
      const chunk = new TextDecoder().decode(value);
      const dataLine = chunk.split('\n').find(line => line.startsWith('data: '));
      const data = JSON.parse(dataLine!.substring(6));
      
      expect(data.type).toBe('heartbeat');
      expect(data.timestamp).toBeDefined();
      
      reader.cancel();
      jest.useRealTimers();
    });

    it('should handle stream cancellation properly', async () => {
      const mockUnsubscribe = jest.fn();
      mockRealtimeListener.subscribeAll.mockReturnValue(mockUnsubscribe);
      
      const request = createMockRequest({
        'accept': 'text/event-stream'
      });
      
      const response = await GET(request);
      const stream = response.body!;
      const reader = stream.getReader();
      
      // Cancel the stream
      reader.cancel();
      
      // The unsubscribe function should have been called
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should handle multiple concurrent connections', async () => {
      const request1 = createMockRequest({ 'accept': 'text/event-stream' });
      const request2 = createMockRequest({ 'accept': 'text/event-stream' });
      
      const response1 = await GET(request1);
      const response2 = await GET(request2);
      
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      // Both should have subscribed
      expect(mockRealtimeListener.subscribeAll).toHaveBeenCalledTimes(2);
      
      // Clean up
      const reader1 = response1.body!.getReader();
      const reader2 = response2.body!.getReader();
      reader1.cancel();
      reader2.cancel();
    });

    it('should set proper CORS headers', async () => {
      const request = createMockRequest({
        'accept': 'text/event-stream'
      });
      
      const response = await GET(request);
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Cache-Control');
    });
  });

  describe('OPTIONS handler', () => {
    it('should return proper CORS headers for preflight requests', async () => {
      const response = await OPTIONS();
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Cache-Control');
    });
  });
}); 