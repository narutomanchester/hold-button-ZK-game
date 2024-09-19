import React, { useState, useEffect } from 'react';
import { FaStar, FaTrophy, FaStopwatch, FaSnowflake } from 'react-icons/fa';
import { AiOutlineReload } from 'react-icons/ai';
import { FaWallet } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import Web3 from 'web3';

const StarTappingGame = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState('ready'); // 'ready', 'playing', 'finished'
  const [bestScore, setBestScore] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [stars, setStars] = useState([]);
  const [tappedStars, setTappedStars] = useState([]);
  const [snowflakes, setSnowflakes] = useState([]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenTimeLeft, setFrozenTimeLeft] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    let interval;
    if (gameState === 'playing' && !isFrozen) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            endGame();
            return 0;
          }
          return prevTime - 1;
        });

        // Generate new stars
        for (let i = 0; i < 10; i++) {
          if (Math.random() < 0.8) {
            generateStar();
          }
        }

        // Generate snowflakes
        for (let i = 0; i < 5; i++) {
          if (Math.random() < 0.6) {
            generateSnowflake();
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, isFrozen]);

  const generateStar = () => {
    const newStar = {
      id: Date.now() + Math.random(),
      x: Math.random() * (window.innerWidth - 50),
      y: -50,
      speed: Math.random() * 2 + 1,
      size: Math.random() * 16 + 16,
    };
    setStars((prevStars) => [...prevStars, newStar]);
  };

  const generateSnowflake = () => {
    const newSnowflake = {
      id: Date.now() + Math.random(),
      x: Math.random() * (window.innerWidth - 50),
      y: -50,
      speed: Math.random() * 1 + 0.5,
      size: Math.random() * 8 + 16,
    };
    setSnowflakes((prevSnowflakes) => [...prevSnowflakes, newSnowflake]);
  };

  useEffect(() => {
    let animationFrame;
    const animateObjects = () => {
      if (!isFrozen) {
        setStars((prevStars) =>
          prevStars
            .map((star) => ({
              ...star,
              y: star.y + star.speed * 0.5,
            }))
            .filter((star) => star.y < window.innerHeight)
        );
        setSnowflakes((prevSnowflakes) =>
          prevSnowflakes
            .map((snowflake) => ({
              ...snowflake,
              y: snowflake.y + snowflake.speed * 0.5,
              x: snowflake.x + Math.sin(snowflake.y * 0.05) * 2, // Add horizontal movement
            }))
            .filter((snowflake) => snowflake.y < window.innerHeight)
        );
      }
      animationFrame = requestAnimationFrame(animateObjects);
    };

    if (gameState === 'playing') {
      animationFrame = requestAnimationFrame(animateObjects);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [gameState, isFrozen]);

  useEffect(() => {
    let frozenInterval;
    if (isFrozen) {
      frozenInterval = setInterval(() => {
        setFrozenTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(frozenInterval);
            setIsFrozen(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(frozenInterval);
  }, [isFrozen]);

  const startGame = () => {
    setGameState('countdown');
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount === 1) {
          clearInterval(countdownInterval);
          setGameState('playing');
          setTimeLeft(30);
          setScore(0);
          setStars([]);
          setTappedStars([]);
          setSnowflakes([]);
          setIsFrozen(false);
          setFrozenTimeLeft(0);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    setGameState('finished');
    if (score > bestScore) {
      setBestScore(score);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const tapStar = (id, x, y) => {
    setScore((prevScore) => prevScore + 1);
    setStars((prevStars) => prevStars.filter((star) => star.id !== id));
    setTappedStars((prevTapped) => [...prevTapped, { id, x, y }]);
    setTimeout(() => {
      setTappedStars((prevTapped) => prevTapped.filter((star) => star.id !== id));
    }, 500);
  };

  const tapSnowflake = (id) => {
    setIsFrozen(true);
    setFrozenTimeLeft(5); // Set frozen time to 5 seconds
    setSnowflakes((prevSnowflakes) => prevSnowflakes.filter((snowflake) => snowflake.id !== id));
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      console.log('Please install MetaMask!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-4 overflow-hidden">
      <h1 className="text-4xl font-bold mb-8 text-white shadow-lg px-6 py-2 rounded-full bg-opacity-30 bg-purple-800">ZK Star Tapping Game</h1>
      
      <div className="mb-6 flex justify-between items-center bg-white bg-opacity-90 rounded-lg shadow-lg p-4 w-full max-w-2xl">
        {walletAddress ? (
          <p className="text-sm font-semibold text-indigo-600 truncate">
            Wallet: {walletAddress}
          </p>
        ) : (
          <button
            onClick={connectWallet}
            className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center"
          >
            <FaWallet className="mr-2" />
            Connect Wallet
          </button>
        )}
        {gameState === 'playing' && (
          <>
            <p className="text-2xl font-semibold text-indigo-600 flex items-center">
              <FaStar className="mr-2 text-yellow-400" />
              {score}
            </p>
            <p className="text-xl font-semibold text-indigo-600 flex items-center">
              <FaStopwatch className="mr-2 text-red-500" />
              {timeLeft}s
            </p>
            {isFrozen && (
              <p className="text-xl font-semibold text-blue-500 flex items-center">
                <FaSnowflake className="mr-2 animate-pulse" />
                {frozenTimeLeft}s
              </p>
            )}
          </>
        )}
      </div>
      
      <div className="bg-white bg-opacity-90 rounded-lg shadow-2xl p-8 max-w-2xl w-full text-center relative overflow-hidden">
        {gameState === 'ready' && (
          <p className="text-lg text-gray-700 mb-6 font-medium">
            Tap falling stars and snowflakes! Stars give points, snowflakes freeze time!
          </p>
        )}

        {gameState === 'countdown' && (
          <p className="text-7xl font-bold text-indigo-600 mb-4 animate-pulse">
            {countdown}
          </p>
        )}

        {gameState === 'finished' && (
          <div className="mb-8">
            <p className="text-2xl font-semibold text-indigo-600 mb-2">
              You tapped {score} stars!
            </p>
            {score === bestScore && (
              <p className="text-lg text-green-500 mt-2 animate-bounce flex items-center justify-center">
                <FaTrophy className="mr-2" />
                New Best Score!
              </p>
            )}
          </div>
        )}

        {gameState === 'ready' && (
          <button
            className="w-full py-4 px-6 rounded-lg bg-indigo-600 text-white font-semibold text-xl transition duration-300 hover:bg-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            onClick={startGame}
          >
            Start Game
          </button>
        )}

        {gameState === 'finished' && (
          <button
            className="mt-4 w-full py-3 px-4 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
            onClick={startGame}
          >
            <AiOutlineReload className="mr-2" />
            Play Again
          </button>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Best Score: <span className="font-semibold text-indigo-600">{bestScore}</span> stars
          </p>
        </div>

        {gameState === 'playing' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ height: '800px' }}>
            {stars.map((star) => (
              <div
                key={star.id}
                className="absolute text-yellow-400 cursor-pointer pointer-events-auto transition-transform hover:scale-110"
                style={{ 
                  left: star.x + 'px', 
                  top: star.y + 'px', 
                  fontSize: star.size + 'px',
                  transform: `rotate(${star.y % 360}deg)`
                }}
                onClick={() => tapStar(star.id, star.x, star.y)}
              >
                <FaStar className="filter drop-shadow-md" />
              </div>
            ))}
            {snowflakes.map((snowflake) => (
              <div
                key={snowflake.id}
                className="absolute text-blue-400 cursor-pointer pointer-events-auto transition-transform hover:scale-110"
                style={{ 
                  left: snowflake.x + 'px', 
                  top: snowflake.y + 'px', 
                  fontSize: snowflake.size + 'px',
                  transform: `rotate(${snowflake.y % 360}deg)`
                }}
                onClick={() => tapSnowflake(snowflake.id)}
              >
                <FaSnowflake className="filter drop-shadow-md animate-pulse" />
              </div>
            ))}
            {tappedStars.map((star) => (
              <div
                key={star.id}
                className="absolute text-yellow-400 pointer-events-none animate-ping"
                style={{ 
                  left: star.x + 'px', 
                  top: star.y + 'px', 
                  fontSize: '24px',
                }}
              >
                <FaStar />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StarTappingGame;
