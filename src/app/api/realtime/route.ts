export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { realtimeListener } from '@/lib/realtime-listener';

// SSE endpoint for real-time updates
export async function GET(request: NextRequest) {
  // Check if client supports SSE
  const accept = request.headers.get('accept');
  if (!accept?.includes('text/event-stream')) {
    return new Response('SSE not supported', { status: 400 });
  }

  // Create readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      console.log('🔗 New SSE client connected');
      
      // Send initial connection event
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify({
          type: 'connection',
          message: 'Connected to realtime updates',
          timestamp: new Date().toISOString()
        })}\n\n`)
      );

      // Subscribe to all realtime events
      const unsubscribe = realtimeListener.subscribeAll(({ channel, event }) => {
        try {
          // Format event for SSE
          const sseData = {
            type: 'database_change',
            channel: channel,
            operation: event.operation,
            table: event.table,
            data: event.new || event.old,
            timestamp: event.timestamp
          };

          // Send to client
          const message = `data: ${JSON.stringify(sseData)}\n\n`;
          controller.enqueue(new TextEncoder().encode(message));
          
          console.log(`📡 Sent ${channel} event to client:`, event.operation);
        } catch (error) {
          console.error('❌ Error sending SSE event:', error);
        }
      });

      // Store cleanup function
      (controller as any)._cleanup = () => {
        console.log('🔌 SSE client disconnected');
        unsubscribe();
      };

      // Send keep-alive every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            })}\n\n`)
          );
        } catch (error) {
          console.log('Client disconnected during heartbeat');
          clearInterval(keepAlive);
        }
      }, 30000);

      // Store interval for cleanup
      (controller as any)._keepAlive = keepAlive;
    },

    cancel() {
      // Cleanup when client disconnects
      const cleanup = (this as any)._cleanup;
      const keepAlive = (this as any)._keepAlive;
      
      if (cleanup) cleanup();
      if (keepAlive) clearInterval(keepAlive);
    }
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
} 