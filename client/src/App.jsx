import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import './App.css';
import Table from './components/Table';
import Login from './components/Login';
import Register from './components/Register';
import Cookies from "js-cookie";


function App() {
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [player, setPlayer] = useState({});

  useEffect(() => {
    axios.get("http://localhost:8000/api/deck")
      .then((res) => {
        setDeck(res.data[0].cards);
      })
      .catch((err) => console.log(err));
  
    const playerData = Cookies.get("player");
    if (playerData) {
      const parsedPlayerData = JSON.parse(playerData);
      setPlayer(parsedPlayerData);
    }
  }, []);
  
  return (
    deck.length > 0 &&
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/play" element={<Table deck={deck} setDeck={setDeck} hand={hand} setHand={setHand} player={player} setPlayer={setPlayer} />} />
          <Route path="/" element={<Login deck={deck} setDeck={setDeck} hand={hand} setHand={setHand} player={player} setPlayer={setPlayer} />} />
          <Route path="/register" element={<Register deck={deck} setDeck={setDeck} hand={hand} setHand={setHand} player={player} setPlayer={setPlayer} />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
