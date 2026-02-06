import React from 'react';
import '../styles/connectionStatus.css';

function ConnectionStatus({ isConnected, isReconnecting }) {
  return (
    <div className={`connection-status ${isConnected ? 'connected' : isReconnecting ? 'reconnecting' : 'disconnected'}`}>
      <span className="status-indicator" />
      <span className="status-text">
        {isConnected && 'Connected'}
        {isReconnecting && 'Reconnecting...'}
        {!isConnected && !isReconnecting && 'Offline'}
      </span>
    </div>
  );
}

export default ConnectionStatus;
