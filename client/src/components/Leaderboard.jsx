import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/players/leaders')
      .then((response) => {
        const sortedLeaders = response.data.sort((a, b) => b.chips - a.chips);
        setLeaders(sortedLeaders);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      <h2>Leaderboard</h2>
      <table className='table table-striped table-hover table-group-divider align-middle border'>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Chips</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((player, index) => (
            <tr key={player._id}>
              <td>{index + 1}</td>
              <td>{player.firstName} {player.lastName}</td>
              <td>{player.chips}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
