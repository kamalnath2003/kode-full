import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const [penEnabled, setPenEnabled] = useState(false);
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(
      // process.env.REACT_APP_URL || 
      'http://localhost:5000', {
      query: { id: sessionId },
      transports: ['websocket'],
    });
    
    setSocket(socketInstance);

    socketInstance.on('codeUpdate', (newCode) => {
      // console.log('Code Update Received:', newCode);
      setCode(newCode);
    });
    
    socketInstance.on('outputUpdate', (data) => {
      console.log('Output Update Received:', data);
      setOutput((prev) => prev + data);
    });//vela seila
    
    socketInstance.on('inputUpdate', (newInput) => {
      console.log('Input Update Received:', newInput);
      setInput(newInput);
    });

    // socketInstance.on('compilationSuccess', () => {
    //   console.log('Compilation Success Event Received');
    //   setIsCompiled(true);
    // });

    socketInstance.on('endProcess', () => {
      console.log('Process Ended');
      setIsRunning(false);
      setIsCompiled(false);
    });

    return () => {
      if (socket) {
        socket.off('compilationSuccess');
        socket.off('endProcess');
        socket.disconnect();
      }
    };
  }, [sessionId]);

  const handleFileNameChange = (event) => {
    setFileName(event.target.value);
  };

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleCodeChange = debounce((value) => {
    setCode(value);
    if (socket) {
      socket.emit('codeChange', value);
    }
  }, 300);

  const handleSaveCode = () => {
    const blob = new Blob([code], { type: 'text/java' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const togglePen = () => {
    setPenEnabled(!penEnabled);
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const startDrawing = (event) => {
    if (!penEnabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    canvas.isDrawing = true;
  };

  const handleCompileAndRun = () => {
    setOutput('');
    setIsRunning(true);
    setIsCompiled(false);
    console.log("running")
    
    if (socket) {
      socket.emit('startCode', { code });
      console.log('Start Code Emitted:', code);
    }
  };

  const finishDrawing = () => {
    const canvas = canvasRef.current;
    canvas.isDrawing = false;
  };

  const handleSendInput = () => {
    if (socket) {
      socket.emit('sendInput', input);
      setInput('');
    }
  };

  const draw = (event) => {
    if (!penEnabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!canvas.isDrawing) return;
    ctx.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    ctx.stroke();
  };
  useEffect(() => {
    if (output && isRunning && !isCompiled) {
      setIsCompiled(true);
    }
  }, [output, isRunning, isCompiled]);

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
        handleFileNameChange,
        handleSaveCode,
        penEnabled,
        togglePen,
        clearDrawing,
        canvasRef,
        startDrawing,
        finishDrawing,
        draw,
        socket,
        debounce,
        handleCodeChange,
        handleCompileAndRun,
        handleSendInput
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
