import React, { useState, useEffect } from 'react';
import PokerHandValue from '../components/PokerHandValues';
import axios from "axios"
import Cookies from 'js-cookie';
import Leaderboard from '../components/Leaderboard';
import { useNavigate } from "react-router-dom"

const Poker = (props) => {
  const { deck, setDeck, player, setPlayer, setFromPoker} = props;
  const [hand, setHand] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [playerHand, setPlayerHand] = useState([]);
  const [handDealt, setHandDealt] = useState(false);
  const [holdStates, setHoldStates] = useState(Array(5).fill('hold'));
	const [drawn, setDrawn] = useState(false)
	const [remainingDeck, setRemainingDeck] = useState([...deck])
	const [betAmount, setBetAmount] = useState(1000);
	const [errorMessage, setErrorMessage] = useState('')
	const [previousBetAmount, setPreviousBetAmount] = useState(betAmount);
  const [gameStarted, setGameStarted] = useState(false)
  const navigate = useNavigate();
  const userToken = JSON.parse(Cookies.get("userToken"));

  useEffect (() => {
    if(!player){
      navigate("/")
    }
  }, []);

  useEffect(() => {
    const pokerSavedGameState = localStorage.getItem('pokerGameState');
  
    if (pokerSavedGameState) {
      const parsedState = JSON.parse(pokerSavedGameState);
      if(parsedState.hand && parsedState.betAmount) { // Safe check
        setHand(parsedState.hand);
        setBetAmount(parsedState.betAmount);
        setGameStarted(true); 
        setDrawn(true)
      }
    }
  }, []);

useEffect(() => {
  const pokerGameState = {
    hand,
    betAmount,
  };

  localStorage.setItem('pokerGameState', JSON.stringify(pokerGameState));
  
}, [hand, betAmount]); 

  const clearPokerGameState = () => {
    localStorage.removeItem('pokerGameState');
  };

  useEffect(() => {
    if (!drawn) {
      clearPokerGameState();
    }
  }, [drawn]);

  const dealNewHand = () => {
    let newHand = []
    let newRemainingDeck = [...deck]
		const bet = parseInt(betAmount, 10);
    if (isNaN(bet) || bet < 1) {
			setErrorMessage('You must bet at least 1 chip');
      return;
    }
    if (bet > player.chips) {
			setErrorMessage("You can't bet more than your total chips!");
      return;
    }
    setErrorMessage('');
		setPreviousBetAmount(betAmount);
    while (newHand.length < 5) {
      const randomCardIndex = Math.floor(Math.random() * newRemainingDeck.length);
      const randomCard = newRemainingDeck[randomCardIndex];
      newHand.push(randomCard);
      newRemainingDeck.splice(randomCardIndex, 1);
    }
    const sortedHand = newHand.slice().sort((a, b) => a.number - b.number);
    // const sortedHand = []   // If I need to check specific hands
    // sortedHand.push(deck[1])
    // sortedHand.push(deck[14])
    // sortedHand.push(deck[28])
    // sortedHand.push(deck[2])
    // sortedHand.push(deck[15])
    setHand(sortedHand);
    setHandDealt(true);
    setHoldStates(Array(5).fill('hold'));
    setDrawn(true)
    setRemainingDeck(newRemainingDeck);

  }
  
  const drawCards = () => {
    let keptHand = []
    let newRemainingDeck = [...remainingDeck];
    hand.map((card, index) => {
      if (holdStates[index] !== 'hold') {
        keptHand.push(card)
      }
    });
    while (keptHand.length < 5) {
      const randomCardIndex = Math.floor(Math.random() * newRemainingDeck.length);
      const randomCard = newRemainingDeck[randomCardIndex];
      keptHand.push(randomCard);
      newRemainingDeck.splice(randomCardIndex, 1);
    }
    const sortedHand = keptHand.slice().sort((a, b) => a.number - b.number);
    setHand(sortedHand);
    setHandDealt(true);
    setHoldStates(Array(5).fill('hold'));
    setDrawn(false)
    setRemainingDeck(newRemainingDeck);
		if(betAmount > player.chips) {
			setBetAmount(player.chips);
		}
  }
  
  const dealCards = () => {
    if (!drawn) {
      setLoaded(true);
      setGameStarted(true)
      dealNewHand();
    } else {
      drawCards();
    }
  };

  const handleReload = () => {
    setPlayer(prevPlayer => ({ ...prevPlayer, chips: 10000 }));
  }
  
  useEffect(() => {
    if (!handDealt || hand.length <= 0) {
      return;
    }
    
    const pokerHandValue = new PokerHandValue(hand).getValue().handStrength;
    if (!drawn) {
			setPlayer(prevPlayer => ({
				...prevPlayer, 
        chips: prevPlayer.chips + (new PokerHandValue(hand).getValue().chipValue * betAmount)
      }));
			
    }
    setPlayerHand(pokerHandValue);
    setHandDealt(false);
  }, [handDealt]);
  
  const holdHandler = (index) => {
    setHoldStates((prevState) => {
      const newState = [...prevState];
      newState[index] = prevState[index] === 'hold' ? 'held' : 'hold';
      return newState;
    });
		setDrawn(true)
  };

  const handleBetChange = (event) => {
    const bet = parseFloat(event.target.value);
    if (isNaN(bet)) {
      setBetAmount('');
    } else if (bet > player.chips) {
      setErrorMessage("You can't bet more than your total chips!");
      setBetAmount(player.chips.toString());
    } else {
      setErrorMessage('');
      setBetAmount(bet.toString());
    }
  };

  const goHome = () => {
    navigate("/home")
  }
  
  const playBlackjack = () => {
    if (drawn){
      setPlayer({...player, chips: player.chips - betAmount});
      navigate("/blackjack")
      setFromPoker(true)
    }
      else{
        navigate("/blackjack")
        setFromPoker(true)
      }
  }

  useEffect(() => {
    if (player._id) {
      axios
        .patch(
          `http://localhost:8000/api/player/update/${player._id}`,
          { id: player._id, chips: player.chips },
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        )
        .then((res) => {
          const updatedPlayer = res.data;
          setPlayer(updatedPlayer);
          Cookies.set("player", JSON.stringify(updatedPlayer), { expires: 30 });
        })
        .catch((err) => {
          err.response.data.errors ? setErrors(err.response.data.errors) : "";
        });
    }
  }, [player.chips]);
  
  
  return (
  <div>
    {!gameStarted ? (
      <div className="wrapper d-flex">
        <div className="loginBox">
          <h2>Welcome to Dojo Poker, {player.firstName}!</h2>
          <h3>You currently have {player.chips} chips</h3>
          <h4 className="mt-3">Bet Amount:</h4>
							<input
								className="text-center bg-light text-dark betAmount fs-5"
								type="number"
                placeholder={isNaN(betAmount) || betAmount === '' ? "Please Place a Bet" : betAmount}
								id="betAmount"
								min="1"
								max={player.chips}
								value={betAmount}
								onChange={handleBetChange}
								disabled={drawn}
							/>
          <button className="dealButton btn btn-outline-dark mt-4 fw-bold" onClick={dealCards} style={{width: '200px'}}> Shuffle Up and Deal! </button>
          <div className="logout-container justify-content-center d-flex">
              <button className="btn btn-primary mt-4 mx-auto" onClick={playBlackjack}>
                Blackjack
              </button>
              <button className="btn btn-warning mt-4 mx-auto" onClick={goHome}>
                Go Home
              </button>
            </div>
        </div>
      </div>
    ) :
    (
      <div>
        <div className="wrapper mt-5">
          <div className="card-container justify-content-center">
          {hand ? (
              hand.map((card, index) => (
              <div key={card._id}>
                <div className="card-container mt-5">
                  <div className="card">
                    {card.suit === 'spades' && <div className="spades" />}
                    {card.suit === 'clubs' && <div className="clubs" />}
                    {card.suit === 'hearts' && <div className="hearts" />}
                    {card.suit === 'diamonds' && <div className="diamonds" />}
                    {card.value}
                  </div>
                </div>
                {drawn ? 
                  <div className="hold-container">
                    <button
                      className={`btn btn-secondary mt-3 ${holdStates[index]}`}
                      onClick={() => holdHandler(index)}
                    >
                      {holdStates[index] === 'hold' && drawn === true ? 'Hold' : 'Held'}
                    </button> 
                  </div>
                  :
                  <div className="hold-container">
                    <button className={`btn btn-secondary mt-3`} disabled>
                    </button>
                  </div>
                }
              </div>
            )))
            : <div></div>}
          </div>
        </div>
        { 
          !drawn
              ? new PokerHandValue(hand).getValue().handStrength === "High Card" 
                  ? <h4 className='mt-3 text-light set-abs'>You lost {previousBetAmount} chips with a High Card</h4> 
                  : new PokerHandValue(hand).getValue().handStrength === "Pair"
                      ? <h4 className='mt-3 text-light set-abs'>You broke even with a pair</h4>
                      : <h4 className='mt-3 text-light set-abs'>You won {new PokerHandValue(hand).getValue().chipValue * previousBetAmount} chips with a {new PokerHandValue(hand).getValue().handStrength}</h4>
              : (
                  new PokerHandValue(hand).getValue().handStrength === "High Card" 
                  ? <h4 className='mt-3 text-light set-abs'>Currently losing {previousBetAmount} chips</h4> 
                  : new PokerHandValue(hand).getValue().handStrength === "Pair"
                      ? <h4 className='mt-3 text-light set-abs'>You are breaking even with a pair</h4>
                      : <h4 className='mt-3 text-light set-abs'>Currently winning {new PokerHandValue(hand).getValue().chipValue * previousBetAmount} chips with a {new PokerHandValue(hand).getValue().handStrength}</h4>
              )
        }
        <div className="playerStatus bg-dark text-white d-flex justify-content-around align-items-center mt-4 p-3">
					<div>
						<h5 className="playerHand text-center bg-light text-dark p-2">You have a {playerHand}</h5>
						<div className="dealButtonContainer d-flex justify-content-center align-items-center mt-3">
							<h4 className='mx-3'>Bet Amount:</h4>
							<input
								className="ml-2 p-1 text-center bg-light text-dark betAmount me-3"
								type="number"
								placeholder={betAmount}
								id="betAmount"
								min="1"
								max={player.chips}
								value={betAmount}
								onChange={handleBetChange}
								disabled={drawn}
							/>
							<div className="d-flex align-items-center drawButtonSmall">
								{ player.chips > 0 ? 
									drawn 
										? <button className="dealButton btn btn-outline-light" onClick={dealCards} style={{width: '120px'}}> Draw </button>
										: <button className="dealButton btn btn-outline-light" onClick={dealCards} style={{width: '120px'}}> New Hand </button>
									: <div style={{width: '100px'}}></div>
								}
							</div>
						</div>
							{errorMessage && <div className="text-danger">{errorMessage}</div>}
					</div>
					<div className='text-light'>
          <div>
            {player.chips <= 0 ? (
              <div>
                <h4 className='mb-0'>Click here to reload:</h4>
                <button className="btn btn-primary mt-2" onClick={handleReload}>Reload</button>
              </div>
            ) : (
              <h3 className='currentChips'>Current Chips: {player.chips}</h3>
            )}
          </div>
          <div className="button-container">
          <button 
            className="btn btn-outline-primary logoutButton mt-4" 
            onClick={playBlackjack}
            disabled={drawn}
          >
            Blackjack
          </button>
            <button className="btn btn-outline-warning logoutButton mt-4" onClick={goHome}>
              Go Home
            </button>
          </div>
        </div>
        </div>
      </div>
    )}
    {/* <Leaderboard/> */}
  </div>
)};

export default Poker;
