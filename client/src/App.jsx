import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import './App.css';
import Poker from './pages/Poker';
import Blackjack from './pages/Blackjack';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cookies from "js-cookie";

function App() {
  const [originalDeck, setOriginalDeck] = useState([]);
  const [deck, setDeck] = useState([]);
  const [player, setPlayer] = useState({});

  useEffect(() => {
    axios.get("http://localhost:8000/api/deck")
      .then((res) => {
        const fetchedDeck = res.data[0].cards;
        setOriginalDeck(fetchedDeck);
        setDeck(fetchedDeck);
      })
      .catch((err) => console.log(err));
      const playerData = Cookies.get("player");
      if (playerData) {
        const parsedPlayerData = JSON.parse(playerData);
        setPlayer(parsedPlayerData);
      }
    }, []);

  const refreshDeck = () => {
    setDeck([...originalDeck]);
  };
  
  return (
    deck.length > 0 &&
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/poker" element={<Poker deck={deck} setDeck={setDeck} player={player} setPlayer={setPlayer} />} />
          <Route path="/blackjack" element={<Blackjack deck={deck} setDeck={setDeck} originalDeck={originalDeck} setOriginalDeck={setOriginalDeck} player={player} setPlayer={setPlayer} refreshDeck={refreshDeck}/>} />
          <Route path="/home" element={<Home deck={deck} setDeck={setDeck} player={player} setPlayer={setPlayer} />} />
          <Route path="/" element={<Login deck={deck} setDeck={setDeck} player={player} setPlayer={setPlayer} />} />
          <Route path="/register" element={<Register deck={deck} setDeck={setDeck} player={player} setPlayer={setPlayer} />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
