import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';

function HomePage() {
  const navigate = useNavigate();

  const createNewSession = () => {
    const sessionId = Math.random().toString(36).substr(2, 9); // Generate a random session ID
    navigate(`/session/${sessionId}`);
  };

  const joinSession = (sessionId) => {
    navigate(`/session/${sessionId}`);
  };

  return (
    <div className="container-fluid">
      <div className="row">
            <Navbar/>

      </div>
      <div className="row"style={{}}>
        <div className="col">
        <button onClick={createNewSession}>Create New Session</button>
        <input
          type="text"
          placeholder="Enter session ID"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              joinSession(e.target.value);
            }
          }}
          />
        </div>
      </div>
    </div>

  );
}

export default HomePage;
