
// // let holdButton = document.getElementById('holdButton');
// // let counter = document.getElementById('counter');
// // let intervalId = null;
// // let seconds = 0;


// // holdButton.addEventListener('mousedown', () => {
// //     intervalId = setInterval(() => {
// //         seconds++;
// //         counter.textContent = seconds;
// //     }, 1000);
// // });

// // holdButton.addEventListener('mouseup', () => {
// //     clearInterval(intervalId);
// //     // seconds = 0;
// //     counter.textContent = seconds;
// // });

// "use strict";

// /**
//  * Example JavaScript code that interacts with the page and Web3 wallets
//  */

//  // Unpkg imports
// const Web3Modal = window.Web3Modal.default;
// const WalletConnectProvider = window.WalletConnectProvider.default;
// const Fortmatic = window.Fortmatic;
// const evmChains = window.evmChains;

// // Web3modal instance
// let web3Modal

// // Chosen wallet provider given by the dialog window
// let provider;


// // Address of the selected account
// let selectedAccount;


// /**
//  * Setup the orchestra
//  */
// function init() {

//   console.log("Initializing example");
//   console.log("WalletConnectProvider is", WalletConnectProvider);
//   console.log("Fortmatic is", Fortmatic);
//   console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

//   // Check that the web page is run in a secure context,
//   // as otherwise MetaMask won't be available
//   if(location.protocol !== 'https:') {
//     // https://ethereum.stackexchange.com/a/62217/620
//     const alert = document.querySelector("#alert-error-https");
//     alert.style.display = "block";
//     document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
//     return;
//   }

//   // Tell Web3modal what providers we have available.
//   // Built-in web browser provider (only one can exist as a time)
//   // like MetaMask, Brave or Opera is added automatically by Web3modal
//   const providerOptions = {
//     walletconnect: {
//       package: WalletConnectProvider,
//       options: {
//         // Mikko's test key - don't copy as your mileage may vary
//         infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
//       }
//     },

//     fortmatic: {
//       package: Fortmatic,
//       options: {
//         // Mikko's TESTNET api key
//         key: "pk_test_391E26A3B43A3350"
//       }
//     }
//   };

//   web3Modal = new Web3Modal({
//     cacheProvider: false, // optional
//     providerOptions, // required
//     disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
//   });

//   console.log("Web3Modal instance is", web3Modal);
// }


// /**
//  * Kick in the UI action after Web3modal dialog has chosen a provider
//  */
// async function fetchAccountData() {

//   // Get a Web3 instance for the wallet
//   const web3 = new Web3(provider);

//   console.log("Web3 instance is", web3);

//   // Get connected chain id from Ethereum node
//   const chainId = await web3.eth.getChainId();
//   // Load chain information over an HTTP API
//   const chainData = evmChains.getChain(chainId);
//   document.querySelector("#network-name").textContent = chainData.name;

//   // Get list of accounts of the connected wallet
//   const accounts = await web3.eth.getAccounts();

//   // MetaMask does not give you all accounts, only the selected account
//   console.log("Got accounts", accounts);
//   selectedAccount = accounts[0];

//   document.querySelector("#selected-account").textContent = selectedAccount;

//   // Get a handl
//   const template = document.querySelector("#template-balance");
//   const accountContainer = document.querySelector("#accounts");

//   // Purge UI elements any previously loaded accounts
//   accountContainer.innerHTML = '';

//   // Go through all accounts and get their ETH balance
//   const rowResolvers = accounts.map(async (address) => {
//     const balance = await web3.eth.getBalance(address);
//     // ethBalance is a BigNumber instance
//     // https://github.com/indutny/bn.js/
//     const ethBalance = web3.utils.fromWei(balance, "ether");
//     const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
//     // Fill in the templated row and put in the document
//     const clone = template.content.cloneNode(true);
//     clone.querySelector(".address").textContent = address;
//     clone.querySelector(".balance").textContent = humanFriendlyBalance;
//     accountContainer.appendChild(clone);
//   });

//   // Because rendering account does its own RPC commucation
//   // with Ethereum node, we do not want to display any results
//   // until data for all accounts is loaded
//   await Promise.all(rowResolvers);

//   // Display fully loaded UI for wallet data
//   document.querySelector("#prepare").style.display = "none";
//   document.querySelector("#connected").style.display = "block";
// }



// /**
//  * Fetch account data for UI when
//  * - User switches accounts in wallet
//  * - User switches networks in wallet
//  * - User connects wallet initially
//  */
// async function refreshAccountData() {

//   // If any current data is displayed when
//   // the user is switching acounts in the wallet
//   // immediate hide this data
//   document.querySelector("#connected").style.display = "none";
//   document.querySelector("#prepare").style.display = "block";

//   // Disable button while UI is loading.
//   // fetchAccountData() will take a while as it communicates
//   // with Ethereum node via JSON-RPC and loads chain data
//   // over an API call.
//   document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
//   await fetchAccountData(provider);
//   document.querySelector("#btn-connect").removeAttribute("disabled")
// }


// /**
//  * Connect wallet button pressed.
//  */
// async function onConnect() {

//   console.log("Opening a dialog", web3Modal);
//   try {
//     provider = await web3Modal.connect();
//   } catch(e) {
//     console.log("Could not get a wallet connection", e);
//     return;
//   }

//   // Subscribe to accounts change
//   provider.on("accountsChanged", (accounts) => {
//     fetchAccountData();
//   });

//   // Subscribe to chainId change
//   provider.on("chainChanged", (chainId) => {
//     fetchAccountData();
//   });

//   // Subscribe to networkId change
//   provider.on("networkChanged", (networkId) => {
//     fetchAccountData();
//   });

//   await refreshAccountData();
// }

// /**
//  * Disconnect wallet button pressed.
//  */
// async function onDisconnect() {

//   console.log("Killing the wallet connection", provider);

//   // TODO: Which providers have close method?
//   if(provider.close) {
//     await provider.close();

//     // If the cached provider is not cleared,
//     // WalletConnect will default to the existing session
//     // and does not allow to re-scan the QR code with a new wallet.
//     // Depending on your use case you may want or want not his behavir.
//     await web3Modal.clearCachedProvider();
//     provider = null;
//   }

//   selectedAccount = null;

//   // Set the UI back to the initial state
//   document.querySelector("#prepare").style.display = "block";
//   document.querySelector("#connected").style.display = "none";
// }


// /**
//  * Main entry point.
//  */
// window.addEventListener('load', async () => {
//   init();
//   document.querySelector("#btn-connect").addEventListener("click", onConnect);
//   document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
// });

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
      <h1 className="text-4xl font-bold mb-8 text-white shadow-lg px-6 py-2 rounded-full bg-opacity-30 bg-purple-800">Star & Snow Tapping Game</h1>
      
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
