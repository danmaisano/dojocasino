  import React, { useState, useEffect } from 'react';
  import axios from "axios";
  import Cookies from 'js-cookie';
  import BlackjackHandValue from '../components/BlackjackHandValues';
  import { useNavigate } from "react-router-dom";
  import Leaderboard from '../components/Leaderboard';

  const Blackjack = (props) => {
    const { deck, setDeck, player, setPlayer, refreshDeck, originalDeck, setOriginalDeck, fromPoker, setFromPoker} = props;
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [betAmount, setBetAmount] = useState(1000);
    const [errorMessage, setErrorMessage] = useState('');
    const [gameStarted, setGameStarted] = useState(false);
    const [showModal, setShowModal] = useState(true);
    const [modalMessage, setModalMessage] = useState('');
    const [drawn, setDrawn] = useState(false);
    const [playerHands, setPlayerHands] = useState([])
    const [doubleDownAvailable, setDoubleDownAvailable] = useState(false);
    const [splitAvailable, setSplitAvailable] = useState(false);
    const [splitActive, setSplitActive] = useState(false)
    const navigate = useNavigate();
    const userToken = JSON.parse(Cookies.get("userToken"));
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    useEffect (() => {
      if(!player){
        navigate("/")
      }
    }, []);

    useEffect(() => {
      const blackjackSavedGameState = localStorage.getItem('blackjackGameState');

      if (blackjackSavedGameState) {
        const parsedState = JSON.parse(blackjackSavedGameState);
        setPlayerHand(parsedState.playerHand);
        setDealerHand(parsedState.dealerHand);
        setBetAmount(parsedState.betAmount);
        setPlayer(parsedState.player);
        setGameStarted(true);
        setShowModal(false);
        if (player.chips < betAmount * 2 ) {
          setDoubleDownAvailable(false)
        }
        else {
          setDoubleDownAvailable(true)
        }
      }
    }, []);

    
    useEffect(() => {
      const blackjackGameState = {
        playerHand,
        dealerHand,
        betAmount,
        player,

      };

      localStorage.setItem('blackjackGameState', JSON.stringify(blackjackGameState));
    }, [player.chips, playerHand, dealerHand, betAmount, player]); 


    const clearBlackjackGameState = () => {
      localStorage.removeItem('blackjackGameState');
    };

    useEffect(() => {
      if (!gameStarted) {
        clearBlackjackGameState();
      }
    }, [gameStarted]);
    
    const dealNewHand = () => {
      setFromPoker(false)
      setDrawn(true)
      refreshDeck();
      if (betAmount > player.chips) {
        setModalMessage(`You don't have enough chips to place this bet! Current chips ${player.chips}`);
        setShowModal(true);
        return;
      }
      if (player.chips < betAmount * 2 ) {
        setDoubleDownAvailable(false)
      }
      else {
        setDoubleDownAvailable(true)
      }
      let newDeck = [...originalDeck];

      const getRandomCard = (newDeck) => {
        const randomIndex = Math.floor(Math.random() * newDeck.length);
        return newDeck.splice(randomIndex, 1)[0];
      };
    
      const playerNewHand = [getRandomCard(newDeck), getRandomCard(newDeck)];
      const dealerNewHand = [getRandomCard(newDeck), getRandomCard(newDeck)];
      if (((playerNewHand[0].number == playerNewHand[1].number) || (playerNewHand[0].number >= 10 && playerNewHand[1].number >= 10)) && player.chips >= betAmount * 2){
        setSplitAvailable(true)
      }
      else{
        setSplitAvailable(false)
      }
      setShowModal(false)
      setDeck(newDeck);
      setPlayerHand(playerNewHand);
      setDealerHand(dealerNewHand);
      setGameStarted(true);
      const handValue = new BlackjackHandValue(playerNewHand);
      const dealerHandValue = new BlackjackHandValue(dealerNewHand);
      if (handValue.isBlackjack() && dealerHandValue.isBlackjack()) {
        setModalMessage(`You both have Blackjack! Push!`);
        setTimeout(() => setShowModal(true), 750);;
        setDrawn(false)

      }
      if (handValue.isBlackjack()) {
        setPlayer({...player, chips: player.chips + betAmount});
        setModalMessage(`Blackjack! Current chips: ${player.chips + betAmount}`);
        setTimeout(() => setShowModal(true), 750);;
        setDrawn(false)

      }
      if (dealerHandValue.isBlackjack()) {
        setPlayer({...player, chips: player.chips - betAmount});
        setModalMessage(`Dealer has Blackjack! Current chips: ${player.chips - betAmount}`);
        setTimeout(() => setShowModal(true), 750);;
        setDrawn(false)

      }
    };

    const hit = () => {
      const getRandomCard = (deck) => {
        const randomIndex = Math.floor(Math.random() * deck.length);
        return deck.splice(randomIndex, 1)[0];
      };
      if(!splitActive){
    
        const newCard = getRandomCard(deck);
    
        const updatedHand = [...playerHand, newCard];
        setPlayerHand(updatedHand);
    
        const handValue = new BlackjackHandValue(updatedHand);
    
        if (handValue.isBust()) {
          setPlayer({...player, chips: player.chips - betAmount});
          setModalMessage(`You busted! Current chips: ${player.chips - betAmount}`);
          setTimeout(() => setShowModal(true), 500);;
          setDrawn(false)
        }
        setDoubleDownAvailable(false)
        setSplitAvailable(false)
      }
    };
    
    


    const stand = async () => {
      const getRandomCard = (deck) => {
        const randomIndex = Math.floor(Math.random() * deck.length);
        return deck.splice(randomIndex, 1)[0];
      };
        let newDealerHand = [...dealerHand];
        let remainingDeck = [...deck];
        
        let dealerHandValueObj = new BlackjackHandValue(newDealerHand);
        let dealerHandValue = dealerHandValueObj.calculateValue();
        
        while (dealerHandValue < 17) {
          await delay(500);
          
          const newCard = getRandomCard(remainingDeck);
          newDealerHand.push(newCard);
          setDealerHand([...newDealerHand]);
          
          dealerHandValueObj = new BlackjackHandValue(newDealerHand);
          dealerHandValue = dealerHandValueObj.calculateValue();
        }
      
      setDealerHand(newDealerHand);
      
      const playerHandValueObj = new BlackjackHandValue(playerHand);
      const playerHandValue = playerHandValueObj.calculateValue();
      
    if (playerHandValue > dealerHandValue || dealerHandValueObj.isBust()) {
      setPlayer({...player, chips: player.chips + betAmount});
      setModalMessage(`You won! Current chips: ${player.chips + betAmount}`);
      setDrawn(false)

    } else if (playerHandValue < dealerHandValue) {
      setPlayer({...player, chips: player.chips - betAmount});
      setModalMessage(`You lost! Current chips: ${player.chips - betAmount}`);
      setDrawn(false)


    } else if (playerHandValue == dealerHandValue) {
      setModalMessage(`Pushed! Current chips: ${player.chips}`);
      setDrawn(false)


    }
    setTimeout(() => setShowModal(true), 750);;
  };
    
    const doubleDown = () => {
      if(doubleDownAvailable){
      const getRandomCard = (newDeck) => {
        const randomIndex = Math.floor(Math.random() * newDeck.length);
        return newDeck.splice(randomIndex, 1)[0];
      };
    
      const newCard = getRandomCard(deck)
    
      const updatedHand = [...playerHand, newCard];
      setPlayerHand(updatedHand);
    
      const handValue = new BlackjackHandValue(updatedHand);
    
      if (handValue.isBust()) {
        setPlayer({...player, chips: player.chips - betAmount * 2});
        setModalMessage(`You busted! Current chips: ${player.chips - betAmount * 2}`);
        setDrawn(false)
        setShowModal(true);
        return
      }

      let newDealerHand = [...dealerHand];
      let remainingDeck = [...deck];

      let dealerHandValueObj = new BlackjackHandValue(newDealerHand);
      let dealerHandValue = dealerHandValueObj.calculateValue();
      
      while (dealerHandValue < 17) {
        const newCard = remainingDeck.shift();
        newDealerHand.push(newCard);
        dealerHandValueObj = new BlackjackHandValue(newDealerHand);
        dealerHandValue = dealerHandValueObj.calculateValue();
      }
      
      setDealerHand(newDealerHand);
      
      const playerHandValueObj = new BlackjackHandValue(updatedHand);
      const playerHandValue = playerHandValueObj.calculateValue();
      
    if (playerHandValue > dealerHandValue || dealerHandValueObj.isBust()) {
      setPlayer({...player, chips: player.chips + betAmount * 2});
      setModalMessage(`You won! Current chips: ${player.chips + betAmount * 2}`);
      setDrawn(false)

    } else if (playerHandValue < dealerHandValue) {
      setPlayer({...player, chips: player.chips - betAmount * 2});
      setModalMessage(`You lost! Current chips: ${player.chips - betAmount * 2}`);
      setDrawn(false)

    } else if (playerHandValue == dealerHandValue) {
      setModalMessage(`Pushed! Current chips: ${player.chips}`);
      setDrawn(false)

    }
    setTimeout(() => setShowModal(true), 750);;
    }};
    
    // const split = () => {
    //   setSplitActive(true)
    //   setBetAmount(betAmount*2)
    //   const getRandomCard = (deck) => {
    //     const randomIndex = Math.floor(Math.random() * deck.length);
    //     return deck.splice(randomIndex, 1)[0];
    //   };
    
    //   const player2Hand = [];
    
    //   while (player2Hand.length < 2) {
    //     let newCard = getRandomCard(deck);
    //     player2Hand.push(newCard);
    //   }
    
    //   const newPlayerHands = [...playerHands, playerHand, player2Hand];
    
    //   setPlayerHands(newPlayerHands);
    //   console.log("New player2Hand:", player2Hand);
    //   console.log("Updated playerHands:", newPlayerHands);
    //   for (i = 0; i < playerHands.length; i++){
    //         let activeHand = playerHands[i]
    //         const newCard = getRandomCard(deck);
    //         activeHand = ([...activeHand, newCard])
    //         const handValue = new BlackjackHandValue(activeHand);
        
    //         if (handValue.isBust()) {
    //           setPlayer({...player, chips: player.chips - betAmount});
    //           setModalMessage(`You busted! Current chips: ${player.chips - betAmount}`);
    //           setTimeout(() => setShowModal(true), 500);;
    //           setDrawn(false)
    //         }
    //         setDoubleDownAvailable(false)
    //         setSplitAvailable(false)
    //       }
    // };
    
    

    const handleBetChange = (event) => {
      const bet = parseFloat(event.target.value);
      if (isNaN(bet)) {
        setBetAmount('');
      } else if (bet > player.chips) {
        setErrorMessage("You can't bet more than your total chips!");
        setBetAmount(player.chips);
      } else {
        setErrorMessage('');
        setBetAmount(bet);
      }
    };
    

    const goHome = () => {
      navigate("/home")
    }

    const playPoker = () => {
      if (drawn){
        setPlayer({...player, chips: player.chips - betAmount});
        navigate("/poker")
        localStorage.clear()
      }
        else{
          navigate("/poker")
          localStorage.clear()
        }
    }

    const handleReload = () => {
      const newChipCount = 10000;
      setPlayer(prevPlayer => ({ ...prevPlayer, chips: newChipCount }));
      setModalMessage(`Reloaded! New chip count: ${newChipCount}`);
      setShowModal(true);
    };


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
            <h2>Welcome to Dojo Blackjack, {player.firstName}!</h2>
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
                />
            <button className="dealButton btn btn-outline-dark mt-4 fw-bold" onClick={dealNewHand} style={{width: '200px'}}> Shuffle Up and Deal! </button>
            <div className="logout-container justify-content-center d-flex">
              <button className="btn btn-primary mt-4 mx-auto" onClick={playPoker}>
                Poker
              </button>
              <button className="btn btn-warning mt-4 mx-auto" onClick={goHome}>
                Go Home
              </button>
            </div>
          </div>
        </div>
        ) : (
          <div className="wrapper">
            <div className="hands-wrapper">
              
              {/* Dealer's Hand */}
              <div className="dealer-hand d-flex justify-content-center">
                {dealerHand.map((card, index) => (
                  <div key={card._id}>
                    <div className="card-container">
                      <div className="card">
                        {card.suit === 'spades' && <div className="spades" />}
                        {card.suit === 'clubs' && <div className="clubs" />}
                        {card.suit === 'hearts' && <div className="hearts" />}
                        {card.suit === 'diamonds' && <div className="diamonds" />}
                        {card.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                <p className='dealer-title'>Dealer's Hand | Current Value: {new BlackjackHandValue(dealerHand).calculateValue()}</p>
              {/* Player's Hand */}
              <div className="player-hand d-flex justify-content-center">
                {playerHand.map((card, index) => (
                  <div key={card._id}>
                    <div className="card-container">
                      <div className="card">
                        {card.suit === 'spades' && <div className="spades" />}
                        {card.suit === 'clubs' && <div className="clubs" />}
                        {card.suit === 'hearts' && <div className="hearts" />}
                        {card.suit === 'diamonds' && <div className="diamonds" />}
                        {card.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="playerStatus bg-dark text-white d-flex justify-content-around align-items-center mt-3">
              <div>
                <h5 className="playerHand text-center bg-light text-dark p-2 rounded">Your Hand Value: {new BlackjackHandValue(playerHand).calculateValue()}</h5>
                <div className="dealButtonContainer d-flex justify-content-center align-items-center mt-3">
                  <button className="btn btn-outline-light me-3" onClick={hit}>Hit</button>
                  <button className="btn btn-outline-light me-3" onClick={stand}>Stand</button>
                  {doubleDownAvailable ? (<button className="btn btn-outline-light me-3" onClick={doubleDown}>Double Down</button> ): (<button className="btn btn-outline-light disabled" onClick={doubleDown}>Double Down</button> )}
                  {/* {splitAvailable ? (<button className="btn btn-outline-light" onClick={split}>Split</button> ): (<button className="btn btn-outline-light disabled" onClick={split}>Split</button> )} */}
                </div>
                {errorMessage && <div className="text-danger">{errorMessage}</div>}
              </div>
              
              <div className="text-light">
                <h3 className="currentChips">Current Chips: {player.chips}</h3>
                <button className="btn btn-outline-warning mt-4" onClick={goHome}>
                  Go Home
                </button>
                {/* {!drawn ? <button type="button" className="btn btn-outline-secondary logoutButton mt-4" onClick={playPoker}>Poker</button> : ""}  // To allow switching between games */}
              </div>
            </div>
          </div>
        )}

        {(showModal && !fromPoker) && (
          <div 
            style={{
              position: 'fixed', 
              top: '0', 
              left: '0',
              width: '100%', 
              height: '100%', 
              backgroundColor: 'rgba(0, 0, 0, 0.6)', 
              zIndex: '1'
            }}
            onClick={() => setShowModal(false)}
          ></div>
        )}
        {(showModal && !fromPoker) && (
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title mx-auto">{modalMessage}</h5>
                </div>
                <div className="modal-body">
                  <h4>Bet Amount:</h4>
                  <input
                    name="betamount"
                    type="number"
                    className="form-control bet-amount"
                    placeholder="Enter your bet"
                    value={betAmount}
                    onChange={handleBetChange}
                  />
                </div>
                <div className="modal-footer">
                {player.chips <= 0 ? (
                  <button type="button" className="btn btn-primary mx-auto" onClick={handleReload}>Reload</button>
                ) : (
                  <>
                    <button type="button" className="btn btn-primary mx-auto" onClick={dealNewHand}>New Hand</button>
                    {!drawn ? <button type="button" className="btn btn-secondary mx-auto" onClick={playPoker}>Poker</button> : null}
                  </>
                )}
              </div>

              </div>
            </div>
          </div>
        )}


        {/* <Leaderboard /> */}
      </div>
    );
              }   

  export default Blackjack;
