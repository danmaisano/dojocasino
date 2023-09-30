
class PokerHandValue {
    constructor(hand) {
      this.hand = hand;
    }
  
    getValue() {
      if (this.isRoyalFlush()) {
        return {"handStrength": "Royal Flush", "chipValue": 250};
      } else if (this.isStraightFlush()) {
        return {"handStrength": "Straight Flush", "chipValue": 50};
			} else if (this.isFourOfAKind()) {
        return {"handStrength": "Four of a Kind", "chipValue": 25};
      } else if (this.isFullHouse()) {
        return {"handStrength": "Full House", "chipValue": 10};
      } else if (this.isFlush()) {
        return {"handStrength": "Flush", "chipValue": 5};
      } else if (this.isStraight()) {
        return {"handStrength": "Straight", "chipValue": 4};
      } else if (this.isThreeOfAKind()) {
        return {"handStrength": "Three of a Kind", "chipValue": 2};
      } else if (this.isTwoPair()) {
        return {"handStrength": "Two Pair", "chipValue": 1};
      } else if (this.isPair()) {
        return {"handStrength": "Pair", "chipValue": 0};
      } else {
        return {"handStrength": "High Card", "chipValue": -1};
      }
    }
  
    isRoyalFlush() {
      if (this.isStraightFlush() && this.hand[4].number === 13) {
        return true;
      }
    }
  
    isStraightFlush() {
      if (this.isFlush() && this.isStraight()) {
        return true;
      }
    }
  
    isFourOfAKind() {
      for (let i = 0; i < this.hand.length; i++) {
        let count = 0;
        for (let j = 0; j < this.hand.length; j++) {
          if (this.hand[i].value === this.hand[j].value) {
            count += 1;
          }
        }
        if (count === 4) {
          return this.hand[i].value;
        }
      }
    }
  
    isFullHouse() {
      let threeOfAKindValue = this.isThreeOfAKind();
      let pairValues = this.isPair();
      if (threeOfAKindValue) {
        if (pairValues.some(value => value !== threeOfAKindValue)) {
          return true;
        }
      }
      return false;
    }
		
  
    isFlush() {
      return this.hand.every((card) => card.suit === this.hand[0].suit);
    }

    isStraight() {
      let sortedHand = [...this.hand].sort((a, b) => a.number - b.number);
    
      // Check for straight with Ace as low
      let isLowStraight = sortedHand.every((card, index) => {
        if (index === 0) return true; // skip the first card
        return card.number === sortedHand[index - 1].number + 1;
      });
    
      // Check for straight with Ace as high (Ace, Ten, Jack, Queen, King)
      let isHighStraight = false;
      if (sortedHand[0].number === 1 && sortedHand[1].number === 10) {
        isHighStraight = sortedHand.slice(1).every((card, index) => {
          if (index === 0) return true; // skip the first card (which is Ten)
          return card.number === sortedHand[index].number + 1;
        });
      }
    
      return isLowStraight || isHighStraight;
    }
    

    isThreeOfAKind() {
      for (let i = 0; i < this.hand.length; i++) {
        let count = 0;
        for (let j = 0; j < this.hand.length; j++) {
          if (this.hand[i].value === this.hand[j].value) {
            count += 1;
          }
        }
        if (count === 3) {
          return this.hand[i].value;
        }
      }
      return false;
    }
  
    isTwoPair() {
      let pairCount = 0;
      for (let i = 0; i < this.hand.length; i++) {
        for (let j = i + 1; j < this.hand.length; j++) {
          if (this.hand[i].value === this.hand[j].value) {
            pairCount += 1;
          }
        }
      }
      if (pairCount === 2) {
        return true;
      }
    }
  
    isPair() {
      let pairs = [];
      for (let i = 0; i < this.hand.length; i++) {
        let card1 = this.hand[i];
        for (let j = i + 1; j < this.hand.length; j++) {
          let card2 = this.hand[j];
          if (card1.value === card2.value) {
            pairs.push(card1.value);
          }
        }
      }
      return pairs.length > 0 ? pairs : false;
    }
		
    isHighCard() {
      return true;
    }
  }
  
export default PokerHandValue