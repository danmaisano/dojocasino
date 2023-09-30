class BlackjackHandValue {
  constructor(hand) {
    this.hand = hand;
  }

  calculateValue() {
    let value = 0;
    let aces = 0;
  
    this.hand.forEach(card => {
      if (card.number >= 10 || ['Jack', 'Queen', 'King'].includes(card.value)) {
        value += 10;
      } else if (card.value === 'Ace') {
        aces += 1;
        value += 11;
      } else {
        value += card.number;
      }
    });
  
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }
  
    return value;
  }

  isBlackjack() {
    return this.calculateValue() === 21;
  }

  isBust() {
    return this.calculateValue() > 21;
  }
}

export default BlackjackHandValue