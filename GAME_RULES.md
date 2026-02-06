# Game Rules & Mechanics

## 🎭 Roles (Fixed Sequence)

All 6 roles are assigned to players at game start. The Seeker must identify them in this exact order:

| Rank | Role | Points | Notes |
|------|------|--------|-------|
| 1 | Girlfriend | 10 pts | Auto-detected, becomes first Seeker |
| 2 | Fling | 8 pts | Casual relationship |
| 3 | Side Chick | 6 pts | Hidden connection |
| 4 | Ex | 4 pts | Past relationship |
| 5 | Ex's Ex | 2 pts | Complicated history |
| 6 | Lover | 0 pts | Final role, no points |

---

## ⏱️ Turn Structure

### Seeker's Actions (30 seconds)
1. **Select** a player from unrevealed players
2. **Input** accusation reason (text)
3. **Confirm** accusation

### Two Outcomes

#### ✅ CORRECT ACCUSATION
```
✓ Claim Points
  └─ Award seeker ROLE_POINTS[role]
✓ Reveal Role
  └─ Public announcement: "Alice is the Girlfriend!"
✓ Role Reveal
  └─ Set player.hasRevealed = true
✓ Transfer Seeker
  └─ Assign newly revealed player as next Seeker
✓ Advance Story
  └─ Move to next role in sequence
  └─ Reset 30-second timer for new seeker
✓ Game Check
  └─ If all 6 roles revealed → GAME END
```

#### ❌ WRONG ACCUSATION
```
✗ No Points Earned
  └─ Seeker gains 0 points
✗ Get Dare
  └─ Random dare from database
  └─ Show dare to Seeker ONLY
  └─ Increment dare.usedCount
✗ Role Swap
  └─ Seeker's role ↔ Accused's role
  └─ Both players' roles updated
✗ Continue Turn
  └─ Same Seeker (changed role identity)
  └─ Same role index (don't advance)
  └─ Reset 30-second timer
✗ Block UI
  └─ Dare popup blocks interaction
  └─ Seeker must confirm "Done" button
✗ Prevent Repeat
  └─ Can't accuse same player twice consecutively
```

---

## ⏰ Timer Mechanics

### Display
- **Visible to**: Seeker only
- **Duration**: 30 seconds per turn
- **Visual**: Cyan bar → Red when ≤10 seconds
- **Audio**: Optional alarm sound when expired

### Expiry Behavior
1. Timer reaches 0 seconds
2. Backend triggers auto-accusation logic
3. System selects first available other player
4. Process as WRONG ACCUSATION (dare applied, roles swapped)

### Timer Reset
- New Seeker = Reset to 30 seconds
- Same Seeker = Reset to 30 seconds (after dare)
- No cumulative time (always fresh 30s)

---

## 🎲 Dare System

### Database Requirements
- **Collection**: `dares`
- **Fields**: `text`, `classroomSafe`, `usedCount`
- **Query Filter**: `classroomSafe == true`
- **Sort**: By `usedCount` ascending (least used first)

### Selection Algorithm
```
1. Query all dares WHERE classroomSafe == true
2. Sort by usedCount (ascending)
3. Take top 5 least-used
4. Pick random from those 5
5. Increment selected dare.usedCount++
6. Show dare text to Seeker only
```

### Example Dares
- "Sing the alphabet backwards"
- "Do your best celebrity impression"
- "Tell us your most embarrassing story"
- "Do 20 jumping jacks"
- "Speak only in questions for 1 minute"

---

## 🔐 Anti-Cheat Rules

### Seeker Validation
```
RULE 1: Only currentSeekerId can issue accusations
└─ Backend validates socket sender == currentSeekerId
└─ Reject if not seeker

RULE 2: Cannot accuse unrevealed/invalid players
└─ Check target player exists
└─ Check player not already revealed
└─ Check player not the seeker themselves

RULE 3: Cannot repeat consecutive accusations
└─ Store lastAccusedPlayer
└─ Reject if accusedPlayerId == lastAccusedPlayer
└─ Reset after correct accusation
```

### Role Privacy
```
LAYER 1: Initial Secret
└─ Only assigned player sees their role

LAYER 2: Revelation
└─ Role revealed AFTER correct accusation
└─ All players see revealed role

LAYER 3: Dare Popup
└─ Dare shows to Seeker only
└─ Blocks all UI (can't interact with game)
└─ Must complete before continuing
```

### Backend Validation
```
All game logic validated on server:
✓ Role correctness checked server-side only
✓ Points awarded server-side only
✓ Timer expiry handled server-side only
✓ Role swaps committed to Firestore only
✓ Client cannot modify game state directly
```

---

## 🏆 Scoring System

### Points Award
- Seeker gains `ROLE_POINTS[role]` if correct
- Points cumulative throughout game
- No points for wrong accusations
- Lover role = 0 points (final role)

### Total Possible Points
Maximum 30 points (10+8+6+4+2+0) if one player finds all roles
→ Practically impossible, shows relative contribution

### Winner Detection
- Final standings sorted by points descending
- Tie-breaker: earliest role revealed (if players tied)
- Can have multiple "winners" if tied

---

## 🎯 Win Conditions

### Game End Trigger
```
IF currentRoleIndex >= ROLES.length (>= 6)
THEN status = 'ended'
└─ No more roles to find
└─ Jump to End Screen
└─ Display final standings
```

### End Screen Shows
1. Winner (highest points)
2. Final standings (all players ranked)
3. Points and roles for each player
4. Game statistics

---

## 📊 Game States

```
WAITING
├─ Players joining via room code
├─ Host can start when 6-8 players ready
└─ No game logic yet

PLAYING
├─ Roles assigned to players
├─ Girlfriend auto-detect & first seeker
├─ Accusation loop active
├─ Timer running
└─ Dare popup may appear

ENDED
├─ All 6 roles revealed
├─ No more turns possible
├─ Show end screen
└─ "Back Home" returns to home
```

---

## 🔄 Example Game Flow

```
Game Start: 6 players, all assigned random roles

Round 1:
  Seeker: Alice (Girlfriend)
  Target Role: Girlfriend
  ├─ Alice not seeking self (different role issue? Girlfriend auto-detected)
  ├─ Accuses Bob
  ├─ Bob's role revealed: "Fling" ❌ WRONG
  ├─ Dare: "Sing alphabet backwards"
  ├─ Alice & Bob swap roles
  ├─ Next role: "Fling" (same index)
  └─ Timer reset

Round 2:
  Seeker: Alice (now has Bob's old role)
  Target Role: Fling
  ├─ Accuses Carol
  ├─ Carol's role: "Fling" ✅ CORRECT
  ├─ Carol: 8 points
  ├─ Carol becomes new Seeker
  ├─ Next role: "Side Chick" (index++)
  └─ Timer reset

Round 3:
  Seeker: Carol (Fling)
  Target Role: Side Chick
  ... continues until all 6 roles found

Game Over: 30 points total distributed
```

---

## 📋 Full Checklist for Organizers

- [ ] Minimum 6 players, maximum 8
- [ ] Clear phone signals/WiFi
- [ ] Everyone understands roles are secret
- [ ] Dare completion is mandatory (on honor system)
- [ ] No peeking at others' phones
- [ ] Have fun and laugh! 😄

---

**Version**: 1.0  
**Last Updated**: Feb 2026  
**Status**: Production Ready ✅
