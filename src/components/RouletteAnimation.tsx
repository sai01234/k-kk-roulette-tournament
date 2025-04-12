import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Participant } from '../types';

interface RouletteAnimationProps {
  participants: [Participant, Participant]; // Exactly two participants for the match
  onAnimationComplete: (winner: Participant) => void;
  isVisible: boolean;
}

const selectWinner = (p1: Participant, p2: Participant): Participant => {
    const totalSlots = p1.slots + p2.slots;
    const randomNum = Math.random() * totalSlots;
    return randomNum < p1.slots ? p1 : p2;
};

const RouletteAnimation: React.FC<RouletteAnimationProps> = ({ participants, onAnimationComplete, isVisible }) => {
  const [p1, p2] = participants;
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [rouletteItems, setRouletteItems] = useState<(Participant | string)[]>([]);
  const [targetX, setTargetX] = useState<number>(0); // State to hold the final position

  useEffect(() => {
    if (isVisible) {
        const items: (Participant | string)[] = [];
        for (let i = 0; i < p1.slots; i++) items.push(p1);
        for (let i = 0; i < p2.slots; i++) items.push(p2);

        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        const baseItems = [...items];
        while (items.length < 100) { // Increased length for smoother animation
            items.push(...baseItems);
        }

        setRouletteItems(items);
        setWinner(null); // Reset winner when animation starts
        setSpinning(false); // Reset spinning state
    }
  }, [isVisible, p1, p2]);


  const startSpin = () => {
    if (!spinning && isVisible) {
      setSpinning(true);
      const determinedWinner = selectWinner(p1, p2);
      console.log("Determined Winner:", determinedWinner.name);

      const spinDuration = Math.random() * 2 + 4; // 4-6 seconds spin duration

      let winningIndex = -1;
      const searchStart = Math.max(0, rouletteItems.length - 30);
      const possibleIndices = rouletteItems
        .map((item, index) => (item === determinedWinner ? index : -1))
        .filter(index => index >= searchStart);

      if (possibleIndices.length > 0) {
          winningIndex = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
      } else {
          winningIndex = rouletteItems.findIndex(item => item === determinedWinner);
          if (winningIndex === -1) winningIndex = Math.floor(rouletteItems.length / 2); // Absolute fallback
      }

      console.log(`Targeting index: ${winningIndex} for winner ${determinedWinner.name}`);

      const itemWidth = 80; // Corresponds to w-20 in Tailwind
      const containerWidth = 448; // max-w-md approx width, adjust if needed
      const markerPosition = containerWidth / 2; // Center marker
      const finalX = markerPosition - (winningIndex * itemWidth + itemWidth / 2);

      const randomOffset = (Math.random() - 0.5) * (itemWidth * 0.4);
      setTargetX(finalX + randomOffset);

      setTimeout(() => {
      }, spinDuration * 1000 + 100); // Add buffer

       setTimeout(() => {
           setWinner(determinedWinner);
       }, spinDuration * 1000 - 500); // Show winner text slightly before stop
    }
  };

  const itemWidth = 80; // w-20

  const rouletteVisual = (
    <div className="w-full h-24 bg-gradient-to-b from-gray-400 to-gray-600 overflow-hidden relative border-4 border-yellow-600 rounded-lg shadow-inner">
      {/* Add fading edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-500 to-transparent z-20"></div>
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-500 to-transparent z-20"></div>

      <motion.div
        className="flex absolute left-0 top-0 h-full"
        initial={{ x: 0 }}
        animate={spinning ? { x: targetX } : {}}
        transition={spinning ? { type: 'spring', damping: 30, stiffness: 80, mass: 2 } : { duration: 0.5 }} // Spring animation
        onAnimationComplete={() => {
            if (spinning) { // Check if it was a spin animation that completed
                 console.log("Animation visually stopped.");
                 setSpinning(false); // Update state when animation actually stops
                 setTimeout(() => {
                     if (winner) { // Ensure winner is set
                        onAnimationComplete(winner);
                     }
                 }, 1200); // Delay before closing modal
            }
        }}
      >
        {rouletteItems.map((item, index) => (
          <div
            key={index}
            style={{ width: `${itemWidth}px` }}
            className={`h-full flex flex-col items-center justify-center text-white font-bold text-sm px-1 text-center border-r border-gray-700 ${
              item === p1 ? 'bg-gradient-to-b from-blue-500 to-blue-700' : 'bg-gradient-to-b from-red-500 to-red-700'
            }`}
          >
            <span className="truncate block w-full">{typeof item === 'object' ? item.name : item}</span>
            {typeof item === 'object' && <span className="text-xs opacity-80">({item.slots})</span>}
          </div>
        ))}
      </motion.div>
      {/* Center marker - styled */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1.5 h-full z-10">
          <div className="w-full h-full bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-300 shadow-lg"></div>
          {/* Triangle pointers */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"></div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-yellow-400"></div>
      </div>
    </div>
  );


  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4">Roulette Battle!</h2>
            <div className="mb-4 text-lg">
              <span className="text-blue-600 font-semibold">{p1.name} ({p1.slots})</span>
              <span className="mx-2">vs</span>
              <span className="text-red-600 font-semibold">{p2.name} ({p2.slots})</span>
            </div>

            {/* Roulette animation */}
            <div className="mb-6 h-24 flex items-center justify-center">
              {rouletteVisual}
            </div>

            {!winner && !spinning && (
              <button
                onClick={startSpin}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-150 ease-in-out transform hover:scale-105"
              >
                Start Roulette!
              </button>
            )}
             {spinning && <p className="text-xl font-semibold text-gray-700 animate-pulse mt-4">Spinning...</p>}
             {winner && ( // Show winner text as soon as winner state is set
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
                    className="mt-6"
                >
                    <p className="text-3xl font-bold text-green-600">Winner:</p>
                    <p className="text-4xl font-extrabold text-yellow-500 animate-pulse">{winner.name}!</p>
                </motion.div>
             )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RouletteAnimation;
