const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  transports: ['websocket'],
  perMessageDeflate: false
});

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const tempFilePath = path.join(tempDir, 'Main.java');

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  let javaProcess = null;
  const { id } = socket.handshake.query;
  socket.join(id);

  socket.on('startCode', ({ code }) => {
    if (javaProcess) {
      javaProcess.kill(); // Ensure no previous process is running
      javaProcess = null; // Reset the process reference
    }

    fs.writeFileSync(tempFilePath, code);

    const javac = spawn('javac', [tempFilePath]);

    javac.stderr.on('data', (data) => {
      io.in(id).emit('outputUpdate', `Compilation error: ${data.toString()}`);
      io.in(id).emit('isCompiled', false); // Indicate compilation failed
    });

    javac.on('close', (code) => {
      if (code === 0) {
        io.in(id).emit('compilationSuccess');
        // io.in(id).emit('isCompiled', true); // Indicate compilation succeeded

        javaProcess = spawn('java', ['-cp', tempDir, 'Main']);

        javaProcess.stdout.on('data', (data) => {
          io.in(id).emit('outputUpdate', data.toString());
        });

        javaProcess.stderr.on('data', (data) => {
          io.in(id).emit('outputUpdate', `Runtime error: ${data.toString()}`);
        });

        javaProcess.on('close', (code) => {
          io.in(id).emit('endProcess'); // Notify clients that the process has ended
          javaProcess = null; // Reset the process reference after it ends
        });
      } else {
        io.in(id).emit('outputUpdate', 'Compilation failed');
        io.in(id).emit('isCompiled', false); // Indicate compilation failed
      }
    });
  });

  socket.on('sendInput', (input) => {
    if (javaProcess) {
      javaProcess.stdin.write(input + '\n');
      io.in(id).emit('inputUpdate', input); // Broadcast input to all clients in the session
    }
  });

  socket.on('codeChange', (newCode) => {
    io.in(id).emit('codeUpdate', newCode); // Broadcast code change
  });

  // Handle the abort event
  socket.on('abort', () => {
    if (javaProcess) {
      javaProcess.kill(); // Terminate the running Java process
      io.in(id).emit('outputUpdate', 'Process aborted by user.');
      io.in(id).emit('endProcess'); // Notify clients that the process has ended
      javaProcess = null; // Reset the process reference after aborting
    }
  });

  socket.on('disconnect', () => {
    if (javaProcess) {
      javaProcess.kill();
      javaProcess = null; // Reset the process reference on disconnect
    }
  });
});

server.listen(5000, () => {
  console.log('Server is listening on port 5000');
});
