/**
 * Player Service - Handles player-related operations
 * Note: Most operations are now in gameService.js for Supabase integration
 * This file is kept for utility functions
 */

/**
 * Get player data from a room
 */
async function getPlayer(db, roomId, playerId) {
  const { data, error } = await db
    .from('players')
    .select('*')
    .eq('room_id', roomId)
    .eq('uid', playerId)
    .single();

  if (error) throw new Error('Player not found');

  return {
    uid: data.uid,
    name: data.name,
    role: data.role,
    points: data.points,
    hasRevealed: data.has_revealed,
    isHost: data.is_host,
  };
}

/**
 * Get all players in a room
 */
async function getPlayersInRoom(db, roomId) {
  const { data, error } = await db
    .from('players')
    .select('*')
    .eq('room_id', roomId);

  if (error) throw new Error('Failed to fetch players');

  return data.map((p) => ({
    uid: p.uid,
    name: p.name,
    role: p.role,
    points: p.points,
    hasRevealed: p.has_revealed,
    isHost: p.is_host,
  }));
}

/**
 * Update player data
 */
async function updatePlayer(db, roomId, playerId, updates) {
  const { error } = await db
    .from('players')
    .update(updates)
    .eq('room_id', roomId)
    .eq('uid', playerId);

  if (error) throw new Error('Failed to update player');
}

/**
 * Get player's own role (private endpoint - only accessible by that player)
 */
async function getPlayerRole(db, roomId, playerId) {
  const player = await getPlayer(db, roomId, playerId);
  return player.role;
}

module.exports = {
  getPlayer,
  getPlayersInRoom,
  updatePlayer,
  getPlayerRole,
};
