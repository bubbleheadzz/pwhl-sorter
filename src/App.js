import React from 'react';
import { useSelector } from 'react-redux';
import './App.css';
import BattleScreen from './components/BattleScreen';
import ResultsScreen from './components/ResultsScreen';

function App() {
  const isFinished = useSelector((state) => state.sorter.isFinished);

  return (
    <div className="app">
      <header>
        <h1>NHL TEAM SORTER</h1>
        <div id="instructions">
          Pick which team you prefer in each matchup to get an accurate list of your
          favourite teams in the NHL.
          <p>
            <u>Note: The more often you hit 'It's a tie', the less accurate your results.</u>
          </p>
        </div>
      </header>

      {!isFinished ? <BattleScreen /> : <ResultsScreen />}

      <footer className="footer">
        <p>
          <small>
            <br />
            <a href="http://edthekraken.carrd.co/">built by edthekraken</a>
          </small>
        </p>
      </footer>
    </div>
  );
}

export default App;
