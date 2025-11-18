import React, { useEffect, useState } from 'react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'log' | 'error' | 'warn';
}

const DebugConsole: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Solo interceptar console en desarrollo
    if (import.meta.env.PROD) return;

    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (message: string, type: 'log' | 'error' | 'warn') => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev, { timestamp, message, type }].slice(-50));
    };

    console.log = (...args: any[]) => {
      originalLog(...args);
      addLog(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '), 'log');
    };

    console.error = (...args: any[]) => {
      originalError(...args);
      addLog(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '), 'error');
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      addLog(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '), 'warn');
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-50"
      >
        📝 Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-95 text-white p-4 max-h-96 overflow-y-auto z-50 font-mono text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">🐛 Debug Console</h3>
        <div className="space-x-2">
          <button
            onClick={() => setLogs([])}
            className="bg-red-600 px-2 py-1 rounded text-xs"
          >
            Limpiar
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="bg-gray-600 px-2 py-1 rounded text-xs"
          >
            Ocultar
          </button>
        </div>
      </div>
      <div className="space-y-1">
        {logs.length === 0 ? (
          <div className="text-gray-400">No hay logs aún...</div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`${
                log.type === 'error'
                  ? 'text-red-400'
                  : log.type === 'warn'
                  ? 'text-yellow-400'
                  : 'text-green-400'
              }`}
            >
              <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DebugConsole; 