import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reset } from '../redux/sorterSlice';
import './ResultsScreen.css';

function ResultsScreen() {
  const dispatch = useDispatch();
  const { teams, rec, equal, numQuestion } = useSelector((state) => state.sorter);

  const handleRestart = () => {
    dispatch(reset());
  };

  // Calculate rankings
  const rankings = [];
  let currentRank = 1;
  let sameRankCount = 1;

  for (let i = 0; i < teams.length; i++) {
    const teamId = rec[i];
    rankings.push({
      rank: currentRank,
      teamId,
      teamName: teams[teamId].name,
    });

    if (i < teams.length - 1) {
      if (equal[rec[i]] === rec[i + 1]) {
        sameRankCount++;
      } else {
        currentRank += sameRankCount;
        sameRankCount = 1;
      }
    }
  }

  return (
    <div className="results-container">
      <div className="battle-info">
        <p className="final-battle">Battle #{numQuestion - 1}</p>
        <p className="final-percent">100% sorted.</p>
      </div>

      <table className="results-table">
        <thead>
          <tr>
            <th className="rank-header">Rank</th>
            <th className="team-header">Team</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((ranking) => (
            <tr key={ranking.teamId}>
              <td className="rank-cell">{ranking.rank}</td>
              <td className="team-cell">{ranking.teamName}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="restart-button" onClick={handleRestart}>
        Sort Again
      </button>
    </div>
  );
}

export default ResultsScreen;
