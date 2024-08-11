import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children, sessionId }) {
  const [code, setCode] = useState('// Shared Java code goes here\n');
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isCompiled, setIsCompiled] = useState(false);
  const [fileName, setFileName] = useState('Main.java');

  
  const [socket, setSocket] = useState(null);

  const handleOutputUpdate = useCallback((data) => {
    setOutput((prev) => prev + data);
  }, []);

  useEffect(() => {
    const socketInstance = io('http://localhost:5000', {
      query: { id: sessionId },
      transports: ['websocket'],
    });
    
    setSocket(socketInstance);

    socketInstance.on('codeUpdate', (newCode) => {
      setCode(newCode);
    });
    
    socketInstance.on('outputUpdate', (data) => {
      console.log('Output Update Received:', data);
      handleOutputUpdate(data);
    });
    
    socketInstance.on('inputUpdate', (newInput) => {
      console.log('Input Update Received:', newInput);
      setInput(newInput);
    });

    socketInstance.on('compilationSuccess', () => {
      console.log('Compilation Success Event Received');
      setIsCompiled(true);
    });

    socketInstance.on('endProcess', () => {
      console.log('Process Ended');
      setIsRunning(false);
      setIsCompiled(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [sessionId, handleOutputUpdate]);

  const handleCompileAndRun = () => {
    setOutput('');
    setIsRunning(true);
    setIsCompiled(false);
    
    if (socket) {
      socket.emit('startCode', { code });
      console.log('Start Code Emitted:', code);
    }
  };
  const handleCodeChange = (value) => {
    setCode(value);
    if (socket) {
      socket.emit('codeChange', value);
    }
  };
  const handleSendInput = () => {
    if (socket) {
      socket.emit('sendInput', input);
      setInput('');
    }
  };

  return (
    <SocketContext.Provider
      value={{
        code,
        setCode,
        output,
        input,
        setInput,
        isRunning,
        isCompiled,
        fileName,
        handleCodeChange,
        handleCompileAndRun,
        handleSendInput
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
