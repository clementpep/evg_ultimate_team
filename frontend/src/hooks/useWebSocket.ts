/**
 * Custom hook for WebSocket connection.
 *
 * Manages WebSocket connection for real-time updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

export const useWebSocket = (endpoint: string, options: UseWebSocketOptions = {}) => {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    reconnect = true,
    reconnectInterval = 3000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      // Get authentication token from localStorage
      const token = localStorage.getItem('auth_token');

      // Build WebSocket URL with token as query parameter
      const wsUrl = token
        ? `${WS_URL}${endpoint}?token=${token}`
        : `${WS_URL}${endpoint}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        wsRef.current = ws;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;
        onDisconnect?.();

        // Attempt to reconnect
        if (reconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
    }
  }, [endpoint, onMessage, onConnect, onDisconnect, reconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current && isConnected) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      wsRef.current.send(message);
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }, [isConnected]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
};
