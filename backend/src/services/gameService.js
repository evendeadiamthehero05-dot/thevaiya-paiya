const { v4: uuidv4 } = require('uuid');

const ROLES = ['GF', 'Fling', 'Side Chick', 'Ex', "Ex's Ex", 'Lover'];
const ROLE_POINTS = {
  'GF': 0,
  'Fling': 10,
  'Side Chick': 8,
  'Ex': 6,
  "Ex's Ex": 4,
  'Lover': 2,
};

const TIMER_DURATION = 30; // 30 seconds per turn

/**
 * Create a new game room
 */
async function createRoom(db, hostName) {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const hostId = uuidv4();

  return new Promise((resolve, reject) => {
    // Create room record
    db.run(
      'INSERT INTO rooms (room_id, status) VALUES (?, ?)',
      [roomId, 'waiting'],
      function (err) {
        if (err) {
          reject(new Error(`Failed to create room: ${err.message}`));
          return;
        }

        // Add host player
        db.run(
          'INSERT INTO players (room_id, uid, name, is_host) VALUES (?, ?, ?, ?)',
          [roomId, hostId, hostName, 1],
          (err) => {
            if (err) {
              reject(new Error(`Failed to add player: ${err.message}`));
              return;
            }

            resolve({
              roomId,
              player: { uid: hostId, name: hostName, isHost: true },
            });
          }
        );
      }
    );
  });
}

/**
 * Fetch room data with all players
 */
async function getRoomData(db, roomId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM rooms WHERE room_id = ?',
      [roomId],
      (err, room) => {
        if (err || !room) {
          reject(new Error('Room not found'));
          return;
        }

        // Return room data regardless of status (waiting/playing/ended)
        // Individual actions (like accusations) still validate room.status separately.

        db.all(
          'SELECT * FROM players WHERE room_id = ?',
          [roomId],
          (err, players) => {
            if (err) {
              reject(new Error(`Failed to fetch players: ${err.message}`));
              return;
            }

            resolve({
              roomId: room.room_id,
              status: room.status,
              currentSeekerId: room.current_seeker_id,
              currentRoleIndex: room.current_role_index,
              lastAccusedPlayer: room.last_accused_player,
              players: players.map((p) => ({
                uid: p.uid,
                name: p.name,
                role: p.role,
                points: p.points,
                hasRevealed: p.has_revealed === 1,
                isHost: p.is_host === 1,
              })),
            });
          }
        );
      }
    );
  });
}

/**
 * Add a player to the room
 */
async function addPlayerToRoom(db, roomId, playerName) {
  return new Promise((resolve, reject) => {
    // Check room exists and not started
    db.get(
      'SELECT status FROM rooms WHERE room_id = ?',
      [roomId],
      (err, room) => {
        if (err || !room) {
          reject(new Error('Room not found'));
          return;
        }
        if (room.status !== 'waiting') {
          reject(new Error('Game has already started'));
          return;
        }

        // Check player count
        db.get(
          'SELECT COUNT(*) as count FROM players WHERE room_id = ?',
          [roomId],
          (err, result) => {
            if (err) {
              reject(new Error('Failed to check player count'));
              return;
            }
            if (result.count >= 6) {
              reject(new Error('Room is full (max 6 players)'));
              return;
            }

            const playerId = uuidv4();

            db.run(
              'INSERT INTO players (room_id, uid, name) VALUES (?, ?, ?)',
              [roomId, playerId, playerName],
              (err) => {
                if (err) {
                  reject(new Error(`Failed to add player: ${err.message}`));
                  return;
                }

                resolve({ uid: playerId, name: playerName });
              }
            );
          }
        );
      }
    );
  });
}

/**
 * Start the game - assign roles and set first Seeker
 */
async function startGame(db, roomId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT status FROM rooms WHERE room_id = ?',
      [roomId],
      (err, room) => {
        if (err || !room) {
          reject(new Error('Room not found'));
          return;
        }
        if (room.status !== 'waiting') {
          reject(new Error('Game already started'));
          return;
        }

        db.all(
          'SELECT uid FROM players WHERE room_id = ?',
          [roomId],
          (err, playersData) => {
            if (err) {
              reject(new Error(`Failed to fetch players: ${err.message}`));
              return;
            }

            const playerCount = playersData.length;
            if (playerCount !== 6) {
              reject(new Error('Game requires exactly 6 players'));
              return;
            }

            // Shuffle roles for exactly 6 players
            const playerIds = playersData.map((p) => p.uid);
            let shuffledRoles = shuffleArray([...ROLES]).slice(0, playerIds.length);

            // Find first GF index (must exist since ROLES contains it)
            const gfIndex = shuffledRoles.indexOf('GF');
            // Safety: if GF is not found for any reason, default to first player
            const gfIndexSafe = gfIndex >= 0 ? gfIndex : 0;
            const girlfriendId = playerIds[gfIndexSafe];

            // Update players with roles
            let updatedCount = 0;
            playerIds.forEach((uid, index) => {
              const role = String(shuffledRoles[index]).trim(); // Normalize role
              db.run(
                'UPDATE players SET role = ? WHERE room_id = ? AND uid = ?',
                [role, roomId, uid],
                (err) => {
                  if (err) {
                    reject(new Error(`Failed to assign roles: ${err.message}`));
                    return;
                  }

                  updatedCount++;

                  if (updatedCount === playerIds.length) {
                    // Log role assignments for debugging (safe in dev only)
                    try {
                      const assignments = playerIds.map((uid, i) => `${uid}=${String(shuffledRoles[i]).trim()}`).join(', ');
                      console.log(`Role assignments for room ${roomId}: ${assignments}`);
                    } catch (e) {
                      // ignore
                    }
                    // All players updated, now update room
                    const timerEndsAt = new Date(
                      Date.now() + TIMER_DURATION * 1000
                    ).toISOString();

                    db.run(
                      `UPDATE rooms SET 
                        status = ?, 
                        current_seeker_id = ?, 
                        current_role_index = ?, 
                        timer_ends_at = ? 
                      WHERE room_id = ?`,
                      ['playing', girlfriendId, 1, timerEndsAt, roomId],
                      (err) => {
                        if (err) {
                          reject(
                            new Error(
                              `Failed to start game: ${err.message}`
                            )
                          );
                          return;
                        }

                        console.log(
                          `Game started in room ${roomId}, GF is ${girlfriendId}, starting with role_index=1 (Fling)`
                        );
                        resolve();
                      }
                    );
                  }
                }
              );
            });
          }
        );
      }
    );
  });
}

/**
 * Process an accusation
 */
async function processAccusation(db, roomId, seekerId, accusedPlayerId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM rooms WHERE room_id = ?',
      [roomId],
      (err, room) => {
        if (err || !room) {
          reject(new Error('Room not found'));
          return;
        }

        // Ensure game is in playing state
        if (room.status !== 'playing') {
          reject(new Error('Game is not currently playing'));
          return;
        }

        // Validate seeker
        if (room.current_seeker_id !== seekerId) {
          reject(new Error('Only the current seeker can make accusations'));
          return;
        }

        // Debug: room state
        console.log(`processAccusation: roomId=${roomId}, status=${room.status}, current_role_index=${room.current_role_index}`);

        // Prevent consecutive accusations
        if (room.last_accused_player === accusedPlayerId) {
          reject(new Error('Cannot accuse the same player consecutively'));
          return;
        }

        // Get accused player
        db.get(
          'SELECT * FROM players WHERE room_id = ? AND uid = ?',
          [roomId, accusedPlayerId],
          (err, accusedPlayer) => {
            if (err || !accusedPlayer) {
              reject(new Error('Accused player not found'));
              return;
            }

              // Prevent accusing an already revealed player
              if (accusedPlayer.has_revealed === 1) {
                reject(new Error('Cannot accuse a player whose role has already been revealed'));
                return;
              }

            // Ensure role index is a valid integer
            let roleIndex = room.current_role_index;
            if (roleIndex === null || roleIndex === undefined) {
              roleIndex = 0;
            } else {
              roleIndex = Number(roleIndex);
              if (!Number.isFinite(roleIndex) || roleIndex < 0 || roleIndex >= ROLES.length) {
                roleIndex = 0;
              }
            }
            const expectedRole = String(ROLES[roleIndex] || '').trim();
            const accusedRoleRaw = accusedPlayer.role || '';
            const accusedRole = String(accusedRoleRaw).trim();
            
            // Log comparison for debugging
            console.log(`Accusation check in room ${roomId}: expected='${expectedRole}' (index=${room.current_role_index}), accused='${accusedRole}' (length=${accusedRole.length})`);
            
            // Normalize and compare (case-insensitive)
            const normalizedExpected = expectedRole.toLowerCase().trim();
            const normalizedAccused = accusedRole.toLowerCase().trim();
            const isCorrect = normalizedAccused === normalizedExpected;
            
            console.log(`\n=== ACCUSATION RESULT ===`);
            console.log(`Room: ${roomId}`);
            console.log(`Seeker: ${seekerId} → Accusing: ${accusedPlayerId}`);
            console.log(`Expected: '${expectedRole}' (index ${roleIndex})`);
            console.log(`Accused role stored: '${accusedRole}'`);
            console.log(`Normalized - Expected:'${normalizedExpected}' vs Accused:'${normalizedAccused}'`);
            console.log(`Match: ${isCorrect}`);
            console.log(`========================\n`);

            if (isCorrect) {
              // CORRECT ACCUSATION
              processCorrectAccusation(
                db,
                roomId,
                accusedPlayerId,
                seekerId,
                expectedRole,
                room.current_role_index,
                resolve,
                reject
              );
            } else {
              // WRONG ACCUSATION
              processWrongAccusation(
                db,
                roomId,
                seekerId,
                accusedPlayerId,
                accusedPlayer.role,
                resolve,
                reject
              );
            }
          }
        );
      }
    );
  });
}

/**
 * Handle correct accusation
 */
function processCorrectAccusation(
  db,
  roomId,
  accusedPlayerId,
  seekerId,
  expectedRole,
  currentRoleIndex,
  resolve,
  reject
) {
  // Reveal role
  db.run(
    'UPDATE players SET has_revealed = 1 WHERE room_id = ? AND uid = ?',
    [roomId, accusedPlayerId],
    (err) => {
      if (err) {
        reject(new Error(`Failed to reveal role: ${err.message}`));
        return;
      }

      // Get seeker points
      db.get(
        'SELECT points FROM players WHERE room_id = ? AND uid = ?',
        [roomId, seekerId],
        (err, seeker) => {
          if (err) {
            reject(new Error('Failed to fetch seeker data'));
            return;
          }

          const pointsEarned = ROLE_POINTS[expectedRole];
          const newPoints = (seeker.points || 0) + pointsEarned;

          // Award points to seeker
          db.run(
            'UPDATE players SET points = ? WHERE room_id = ? AND uid = ?',
            [newPoints, roomId, seekerId],
            (err) => {
              if (err) {
                reject(new Error('Failed to award points'));
                return;
              }

              const nextRoleIndex = currentRoleIndex + 1;

              if (nextRoleIndex >= ROLES.length) {
                // Game ended
                console.log(`\n✅ GAME ENDED - All roles found!`);
                console.log(`Final winner: ${accusedPlayerId}`);
                db.run(
                  'UPDATE rooms SET status = ? WHERE room_id = ?',
                  ['ended', roomId],
                  (err) => {
                    if (err) {
                      reject(new Error('Failed to end game'));
                      return;
                    }

                    resolve({
                      isCorrect: true,
                      newSeekerId: accusedPlayerId,
                      nextRole: null,
                      pointsEarned,
                      gameEnded: true,
                    });
                  }
                );
              } else {
                console.log(`\n⭐ CORRECT! Role '${expectedRole}' found by seeker`);
                console.log(`Next role to find: '${ROLES[nextRoleIndex]}' (index ${nextRoleIndex})`);
                console.log(`New Seeker: ${accusedPlayerId}\n`);
                
                const timerEndsAt = new Date(
                  Date.now() + TIMER_DURATION * 1000
                ).toISOString();

                // Transfer seeker role
                db.run(
                  `UPDATE rooms SET 
                    current_seeker_id = ?, 
                    current_role_index = ?, 
                    last_accused_player = NULL, 
                    timer_ends_at = ? 
                  WHERE room_id = ?`,
                  [accusedPlayerId, nextRoleIndex, timerEndsAt, roomId],
                  (err) => {
                    if (err) {
                      reject(new Error('Failed to transfer seeker'));
                      return;
                    }

                    resolve({
                      isCorrect: true,
                      newSeekerId: accusedPlayerId,
                      nextRole: ROLES[nextRoleIndex],
                      pointsEarned,
                    });
                  }
                );
              }
            }
          );
        }
      );
    }
  );
}

/**
 * Handle wrong accusation
 */
function processWrongAccusation(
  db,
  roomId,
  seekerId,
  accusedPlayerId,
  accusedRole,
  resolve,
  reject
) {
  // Get dare
  getRandomDare(db)
    .then((dare) => {
      // Get seeker role
      db.get(
        'SELECT role FROM players WHERE room_id = ? AND uid = ?',
        [roomId, seekerId],
        (err, seeker) => {
          if (err) {
            reject(new Error('Failed to fetch seeker role'));
            return;
          }

          const seekerRole = seeker.role;

          // Swap roles
          db.run(
            'UPDATE players SET role = ? WHERE room_id = ? AND uid = ?',
            [accusedRole, roomId, seekerId],
            (err) => {
              if (err) {
                reject(new Error('Failed to swap roles'));
                return;
              }

              db.run(
                'UPDATE players SET role = ? WHERE room_id = ? AND uid = ?',
                [seekerRole, roomId, accusedPlayerId],
                (err) => {
                  if (err) {
                    reject(new Error('Failed to swap roles'));
                    return;
                  }

                  // Update last accused and change seeker to accused player
                  const timerEndsAt = new Date(
                    Date.now() + TIMER_DURATION * 1000
                  ).toISOString();
                  
                  db.run(
                    'UPDATE rooms SET last_accused_player = ?, current_seeker_id = ?, timer_ends_at = ? WHERE room_id = ?',
                    [accusedPlayerId, accusedPlayerId, timerEndsAt, roomId],
                    (err) => {
                      if (err) {
                        reject(new Error('Failed to update seeker and last accused'));
                        return;
                      }

                      resolve({
                        isCorrect: false,
                        dare,
                        newSeekerId: accusedPlayerId,
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    })
    .catch((err) => {
      reject(err);
    });
}

/**
 * Get a random dare from database
 */
async function getRandomDare(db) {
  return new Promise((resolve, reject) => {
    // Get top 5 least-used dares
    db.all(
      `SELECT * FROM dares 
       WHERE classroom_safe = 1 
       ORDER BY used_count ASC 
       LIMIT 5`,
      [],
      (err, dares) => {
        if (err || !dares || dares.length === 0) {
          reject(new Error('No dares available'));
          return;
        }

        // Pick random from top 5
        const randomDare = dares[Math.floor(Math.random() * dares.length)];

        // Increment used count
        db.run(
          'UPDATE dares SET used_count = used_count + 1 WHERE id = ?',
          [randomDare.id],
          (err) => {
            if (err) {
              reject(new Error('Failed to update dare count'));
              return;
            }

            resolve({
              id: randomDare.id,
              text: randomDare.text,
            });
          }
        );
      }
    );
  });
}

/**
 * Utility function to shuffle array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Reset the game to play again with new roles
 */
async function resetGame(db, roomId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM rooms WHERE room_id = ?',
      [roomId],
      (err, room) => {
        if (err || !room) {
          reject(new Error('Room not found'));
          return;
        }

        // Get all players
        db.all(
          'SELECT uid FROM players WHERE room_id = ? ORDER BY uid',
          [roomId],
          (err, players) => {
            if (err || !players || players.length < 2) {
              reject(new Error('Invalid player count'));
              return;
            }

            const playerIds = players.map((p) => p.uid);
            const shuffledRoles = shuffleArray(ROLES);
            const girlfriendId = playerIds[0]; // First player is always GF

            // Reset all players: reset points, has_revealed, and assign new roles
            let updatedCount = 0;
            playerIds.forEach((uid, index) => {
              const role = String(shuffledRoles[index]).trim();
              db.run(
                'UPDATE players SET role = ?, points = 0, has_revealed = 0 WHERE room_id = ? AND uid = ?',
                [role, roomId, uid],
                (err) => {
                  if (err) {
                    reject(new Error(`Failed to reset players: ${err.message}`));
                    return;
                  }

                  updatedCount++;

                  if (updatedCount === playerIds.length) {
                    // All players reset, now update room
                    const timerEndsAt = new Date(
                      Date.now() + TIMER_DURATION * 1000
                    ).toISOString();

                    db.run(
                      `UPDATE rooms SET 
                        status = ?, 
                        current_seeker_id = ?, 
                        current_role_index = ?, 
                        timer_ends_at = ?,
                        last_accused_player = NULL
                      WHERE room_id = ?`,
                      ['playing', girlfriendId, 1, timerEndsAt, roomId],
                      (err) => {
                        if (err) {
                          reject(
                            new Error(
                              `Failed to reset game: ${err.message}`
                            )
                          );
                          return;
                        }

                        console.log(
                          `Game reset in room ${roomId}, starting new round with GF ${girlfriendId}`
                        );
                        resolve();
                      }
                    );
                  }
                }
              );
            });
          }
        );
      }
    );
  });
}

module.exports = {
  createRoom,
  getRoomData,
  addPlayerToRoom,
  startGame,
  processAccusation,
  getRandomDare,
  resetGame
};