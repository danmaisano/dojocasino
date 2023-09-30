import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Home = (props) => {
  const { player, setPlayer } = props;
  const navigate = useNavigate();

  const handleLogout = () => {
    setPlayer(null);
    Cookies.remove("player");
    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="row justify-content-center">
          
          <h2 className="text-nowrap">Welcome, {player.firstName}!</h2>
          
          <h4 className='mb-4'>You have {player.chips} chips.</h4>
          
          <div className="btn-group" role="group">
            <button 
              type="button" 
              className="btn btn-primary me-2"
              onClick={() => navigate("/poker")}
            >
              Play Poker
            </button>
            
            <button 
              type="button" 
              className="btn btn-secondary me-2"
              onClick={() => navigate("/blackjack")}
            >
              Play Blackjack
            </button>
          </div>
          
          <div className="mt-3 float-end">
            <button 
              type="button" 
              className="btn btn-danger"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          
      </div>
    </div>
  );
};

export default Home;
