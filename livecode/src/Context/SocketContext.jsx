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
  const {id} = useRef();

  const [socket, setSocket] = useState(null);

  const handleOutputUpdate = useCallback((data) => {
    setOutput((prev) => prev + data);
  }, []);

  useEffect(() => {
    const socketInstance = io(process.env.NODE_ENV === 'production' 
      ? 'https://kode-full-production.up.railway.app' 
      : 'http://localhost:5000', {
        query: { id },  
        transports: ['websocket']
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
  const handleSaveCode = () => {
    const blob = new Blob([code], { type: 'text/java' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleAbort = () => {
    if (isRunning && socket) {
      socket.emit('abort');  // Emit the abort event to the server
      setIsRunning(false);   // Update the state to reflect that the process is no longer running
    }
  };

  return (
    <SocketContext.Provider
      value={{
        code,
        id,
        setCode,
        output,
        input,
        setInput,
        isRunning,
        isCompiled,
        fileName,
        handleCodeChange,
        handleCompileAndRun,
        handleSendInput,
        handleSaveCode,
        handleAbort,   // Expose handleAbort to the context
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
