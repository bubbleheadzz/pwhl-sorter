import React from 'react';
import { useSelector } from 'react-redux';
import './TeamCard.css';

function TeamCard({ teamId }) {
  const team = useSelector((state) => state.sorter.teams[teamId]);

  if (!team) return null;

  return (
    <div className="team-card">
      <div className="team-name">{team.displayName}</div>
      <img
        src={team.logo}
        alt={`${team.name} logo`}
        width="100"
        height="100"
        className="team-logo"
      />
    </div>
  );
}

export default TeamCard;
