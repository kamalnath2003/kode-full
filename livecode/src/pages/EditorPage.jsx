import React from 'react';
import { SocketProvider, useSocket } from '../Context/SocketContext';
import { Editor } from '@monaco-editor/react';
import Navbar from '../Components/Navbar';
import { useParams } from 'react-router-dom';

function EditorPageContent() {
  const { id } = useParams();
  const {

    code,
    handleCodeChange,
    handleCompileAndRun,
    isRunning,
    setInput,
    fileName,
    handleFileNameChange,
    input,
    handleSendInput,
    handleSaveCode,
    output,
    isCompiled,
    handleAbort



  } = useSocket();
  // const {
  //   code,
  //   output,
  //   input,
  //   setInput,
  //   isRunning,
  //   isCompiled,
  //   handleCodeChange,
  //   handleCompileAndRun,
  //   handleSendInput,
  //   handleAbort,
  //   fileName,
  //   handleFileNameChange,
  //   handleSaveCode,
  // } = useSocket();

  //console.log('EditorPageContent props:', {
  // code,
  // output
  // input,
  // isRunning,
  // isCompiled
  //  });  Debugging

  return (
    <section className='gradient-custom1 ' style={{paddingBottom:'25%'}}>

   
    <div className="container-fluid mx-0 p-0 ">
      <Navbar
        page='editor'
        id={id}
        fileName={fileName}
        handleFileNameChange={handleFileNameChange}
        handleSaveCode={handleSaveCode}
      />
      <div className="row" style={{ marginRight: "0px" }}>
        <div className="col">
          <div className="editor-page">
            <Editor
              height="60vh"
              language="java"
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
            />
          </div>
        </div>
        <div className="col boxx output-container" id="outputbox">
          <div className="output-container">
            <div className="output-label">Output:</div>
            <pre>{output}</pre>
          </div>
        </div>
      </div>
      <div className="row mr-0" style={{ marginRight: "0px" }}>
        <div className="col">
          <button className='button-25 ms-5 px-5 ' onClick={handleCompileAndRun} disabled={isRunning}>
            Run
          </button>
          <button className='button-24 ms-5 px-5' onClick={handleAbort} disabled={!isRunning}>
            Abort
          </button>
          {isRunning && (
            <div style={{ marginLeft: '20%' }}>
              <div data-mdb-input-init class="form-outline w-50 d-flex mt-2">
                <textarea class="form-control" placeholder="Enter input for your program"
                  value={input}
                  onChange={(e) => setInput(e.target.value)} id="textAreaExample1" rows="4"></textarea>
               
              <button   onClick={handleSendInput} disabled={!isCompiled} data-mdb-button-init data-mdb-ripple-init class="btn btn-dark btn-lg btn-block" type="button">Send input</button>
              </div>


          
            </div>
          )}
        </div>
      </div>
    </div>
    
</section>
  );
}


function EditorPage() {
  const { id } = useParams();

  return (

    <SocketProvider sessionId={id}>
      <EditorPageContent />
    </SocketProvider>
  );
}

export default EditorPage;
