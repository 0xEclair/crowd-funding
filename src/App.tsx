import React, { useEffect, useState } from 'react';
import './App.css';
import { campaigns } from "./solana/campaign";
import { CampaignCard } from "./components/card";

function App() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    campaigns().then((cams) => {
      setCards(cams as any);
    })
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        {
          cards.map((e, index) => (
            <div className={"campaign-card"} key={index}>
              {CampaignCard(e)}
            </div>
          ))
        }
        <p>
          crowd funding.
        </p>
        <a
          className="App-link"
          href="https://github.com/eclair-lumiere/crowd-funding"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source
        </a>
      </header>
    </div>
  );
}

export default App;
