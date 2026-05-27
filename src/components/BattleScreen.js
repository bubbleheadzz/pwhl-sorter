import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveHistory, makeChoice, undoChoice } from '../redux/sorterSlice';
import TeamCard from './TeamCard';
import './BattleScreen.css';

function BattleScreen() {
  const dispatch = useDispatch();
  const { lists, cmp1, cmp2, head1, head2, numQuestion, finishSize, totalSize, history, historyIndex } =
    useSelector((state) => state.sorter);

  const team1Id = lists[cmp1][head1];
  const team2Id = lists[cmp2][head2];
  const progressPercent = Math.floor((finishSize * 100) / totalSize);
  const canUndo = historyIndex >= 0;

  const handleChoice = (flag) => {
    dispatch(saveHistory());
    dispatch(makeChoice({ flag }));
  };

  const handleUndo = () => {
    dispatch(undoChoice());
  };

  return (
    <div className="battle-container">
      <div className="battle-info">
        <p className="battle-number">Battle #{numQuestion}</p>
        <p className="progress">{progressPercent}% sorted</p>
      </div>

      <table className="main-table">
        <tbody>
          <tr>
            <td colSpan="3" className="battle-header">
              <strong>
                <br />
                Battle #{numQuestion}
                <br />
                {progressPercent}% sorted.
              </strong>
            </td>
          </tr>
          <tr>
            <td className="team-field left-field" onClick={() => handleChoice(-1)}>
              <TeamCard teamId={team1Id} />
            </td>
            <td className="middle-column">
              <div className="button-group">
                <button
                  className="choice-button tie-button"
                  onClick={() => handleChoice(0)}
                  aria-label="Mark as tie"
                >
                  <br />
                  It's a tie
                  <br />
                </button>
              </div>
              <div className="button-group">
                <button
                  className={`choice-button back-button ${!canUndo ? 'disabled' : ''}`}
                  onClick={handleUndo}
                  disabled={!canUndo}
                  aria-label="Undo last choice"
                >
                  <br />
                  Back
                  <br />
                </button>
              </div>
            </td>
            <td className="team-field right-field" onClick={() => handleChoice(1)}>
              <TeamCard teamId={team2Id} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default BattleScreen;
