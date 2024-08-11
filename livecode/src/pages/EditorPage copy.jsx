import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import io from 'socket.io-client';

function EditorPage() {
  const { id } = useParams();
  const [code, setCode] = useState('// Shared Java code goes here\n');
  const [output, setOutput] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5000', {
        query: { id },
        transports: ['websocket'],
      });

      const socket = socketRef.current;

      // Listen for code updates from the server
      socket.on('codeUpdate', (newCode) => {
        console.log('Code Update Received:', newCode);
        setCode(newCode);
      });

      // Listen for output updates from the server
      socket.on('outputUpdate', (data) => {
        console.log('Output Update Received:', data);
        setOutput((prevOutput) => prevOutput + data);
      });

      socket.on('compilationSuccess', () => {
        console.log('Compilation Successful');
      });

      socket.on('endProcess', () => {
        console.log('Process Ended');
      });

      // Cleanup on unmount
      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [id]);

  const handleCodeChange = (value) => {
    if (value !== undefined) {
      setCode(value);
      if (socketRef.current) {
        console.log('Emitting Code Change:', value);
        socketRef.current.emit('codeChange', value); // Emit code changes
      }
    }
  };

  const handleCompileAndRun = () => {
    setOutput(''); // Clear previous output
    if (socketRef.current) {
      console.log('Emitting Start Code:', code);
      socketRef.current.emit('startCode', { code }); // Emit the compile & run command
    }
  };

  return (
    <div className="editor-page">
      <h2>Session ID: {id}</h2>
      <Editor
        height="80vh"
        language="java"
        theme="vs-dark"
        value={code}
        onChange={handleCodeChange}
      />
      <button onClick={handleCompileAndRun}>Compile & Run</button>
      <div className="output-container">
        <div className="output-label">Output:</div>
        <pre>{output}</pre>
      </div>
    </div>
  );
}

export default EditorPage;
