# Multiplayer Patterns — Netcode, Sessions, Economy, World Generation

Detailed patterns for browser multiplayer game engineering. Adapt to your project's requirements.

---

## 1. Netcode Deep Dive

### Client-Server Message Flow (Movement Example)

```
Time →

Client                          Server                         Other Clients
  |                               |                               |
  |-- move:request {to: 3/4} --->|                               |
  |   (client shows prediction)   |                               |
  |                               |-- validate position ---------|
  |                               |-- check: is player IDLE? ----|
  |                               |-- calculate duration --------|
  |                               |-- create action record ------|
  |                               |-- schedule BullMQ job -------|
  |                               |                               |
  |<-- move:confirmed {          |                               |
  |     startedAt, endsAt,       |                               |
  |     path: [...] } ------------|                               |
  |                               |-- broadcast to sector ------>|
  |   (client shows countdown)   |                   (show movement animation)
  |                               |                               |
  |   ... time passes ...        |                               |
  |                               |                               |
  |                               |<-- BullMQ job fires ---------|
  |                               |-- update DB position --------|
  |                               |-- set player IDLE ------------|
  |                               |                               |
  |<-- move:completed {          |-- broadcast arrival -------->|
  |     newPosition: 3/4 } ------|                               |
```

### Optimistic UI Pattern (for responsive feel)

```typescript
// Client: show immediate feedback, correct on server response
function handleMoveClick(targetTile: WorldPosition) {
  // 1. Optimistic update (immediate visual feedback)
  const prediction = {
    id: generateLocalId(),
    type: 'MOVEMENT',
    target: targetTile,
    predictedArrival: estimateArrival(currentPosition, targetTile),
  };
  gameStore.addPendingAction(prediction);
  renderer.startMoveAnimation(currentPosition, targetTile);

  // 2. Send request to server
  socket.emit(SocketEvents.PLAYER_MOVE_REQUEST, {
    target: targetTile,
    predictionId: prediction.id,
  });

  // 3. Handle server response
  socket.once(SocketEvents.PLAYER_MOVE_CONFIRMED, (data) => {
    gameStore.confirmAction(prediction.id, data);
    // Adjust animation timing to match server's endsAt
    renderer.adjustMoveAnimation(data.endsAt);
  });

  socket.once(SocketEvents.PLAYER_MOVE_REJECTED, (data) => {
    gameStore.rejectAction(prediction.id);
    renderer.cancelMoveAnimation();
    renderer.snapToPosition(currentPosition); // rollback
    showError(data.reason);
  });
}
```

### Connection State Machine

```
                    ┌──────────────┐
                    │ DISCONNECTED │
                    └──────┬───────┘
                           │ connect()
                           ▼
                    ┌──────────────┐
              ┌─────│ CONNECTING   │
              │     └──────┬───────┘
              │            │ connected
              │            ▼
    timeout   │     ┌──────────────┐
              │     │  CONNECTED   │◄─── reconnected
              │     └──────┬───────┘         │
              │            │ disconnected    │
              │            ▼                 │
              │     ┌──────────────┐         │
              └────►│ RECONNECTING │─────────┘
                    └──────┬───────┘
                           │ max retries exceeded
                           ▼
                    ┌──────────────┐
                    │    FAILED    │
                    └──────────────┘
```

```typescript
// Client connection manager
class ConnectionManager {
  private state: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'FAILED';
  private retryCount = 0;
  private maxRetries = 10;
  private baseDelay = 1000; // ms

  async reconnect() {
    this.state = 'RECONNECTING';
    while (this.retryCount < this.maxRetries) {
      const delay = this.baseDelay * Math.pow(2, this.retryCount) + Math.random() * 1000;
      await sleep(Math.min(delay, 30000)); // cap at 30s

      try {
        await this.connect();
        this.retryCount = 0;
        this.state = 'CONNECTED';
        await this.requestStateResync();
        return;
      } catch {
        this.retryCount++;
      }
    }
    this.state = 'FAILED';
    this.showReconnectFailedUI();
  }

  private async requestStateResync() {
    socket.emit(SocketEvents.RECONNECT_STATE, {
      lastKnownSequence: gameStore.lastSequenceNumber,
    });
  }
}
```

---

## 2. Session Lifecycle Patterns

### Full Session Flow

```
1. LOBBY
   └── Player creates or joins lobby
   └── Lobby state: { players, settings, readyStatus }
   └── All players ready → transition to MATCHMAKING (or skip for custom games)

2. MATCHMAKING (optional, for competitive/ranked)
   └── Player enters queue with criteria (skill, region, mode)
   └── Matchmaker finds compatible players
   └── Creates match → assigns to game server
   └── Timeout → expand criteria or cancel

3. ALLOCATION
   └── Select game server (warm pool preferred)
   └── Initialize game state
   └── Send join tokens to matched players

4. JOIN
   └── Players connect to assigned server
   └── Server sends initial state (full snapshot)
   └── Grace period for late joiners
   └── Game starts when min players connected (or timeout)

5. PLAYING
   └── Game loop (ticks or event-driven)
   └── State sync, input processing, broadcasting
   └── Handles disconnect/reconnect mid-game

6. RECONNECT (during PLAYING)
   └── Player disconnects → server marks as disconnected
   └── Grace period (e.g., 60s): player's character stays in game
   └── Reconnect within grace → state resync → resume
   └── Grace expired → player kicked, replacement allowed (if applicable)

7. END
   └── Win/loss/draw condition met, or time limit
   └── Server calculates results
   └── Persist: match history, stats, rewards, leaderboard updates
   └── Broadcast results to all players
   └── Cleanup server resources

8. POST-GAME
   └── Players see results screen
   └── Option to rematch, return to lobby, or quit
   └── Server session resources freed
```

### Matchmaking Algorithm (simple ELO-based)

```typescript
interface MatchmakingEntry {
  playerId: string;
  rating: number;
  queuedAt: Date;
  region: string;
  expandedRange: number; // increases over time
}

function findMatch(queue: MatchmakingEntry[]): Match | null {
  const sorted = queue.sort((a, b) => a.rating - b.rating);

  for (let i = 0; i < sorted.length - 1; i++) {
    const player = sorted[i];
    const opponent = sorted[i + 1];
    const ratingDiff = Math.abs(player.rating - opponent.rating);
    const maxDiff = Math.max(player.expandedRange, opponent.expandedRange);

    if (ratingDiff <= maxDiff && player.region === opponent.region) {
      return { players: [player.playerId, opponent.playerId] };
    }
  }

  // Expand range for players waiting too long
  const now = Date.now();
  for (const entry of queue) {
    const waitTimeMs = now - entry.queuedAt.getTime();
    entry.expandedRange = BASE_RATING_RANGE + Math.floor(waitTimeMs / 10000) * 50;
  }

  return null;
}
```

---

## 3. Economy Protection Patterns

### Double-Spend Prevention (Full Pattern)

```typescript
// 1. Client sends purchase request with idempotency key
const idempotencyKey = `purchase-${itemId}-${Date.now()}-${crypto.randomUUID()}`;
socket.emit('shop:purchase', { itemId, idempotencyKey });

// 2. Server processes with full protection
async function purchaseItem(playerId: string, itemId: string, idempotencyKey: string) {
  return db.$transaction(async (tx) => {
    // 2a. Idempotency check
    const existing = await tx.purchaseLog.findUnique({ where: { idempotencyKey } });
    if (existing) return existing.result; // already processed

    // 2b. Lock player row (prevents concurrent purchases)
    const player = await tx.$queryRaw<Player[]>`
      SELECT * FROM players WHERE id = ${playerId} FOR UPDATE
    `;

    // 2c. Lock item (prevents selling item that's being purchased)
    const item = await tx.$queryRaw<ShopItem[]>`
      SELECT * FROM shop_items WHERE id = ${itemId} FOR UPDATE
    `;

    // 2d. Validate
    if (!item || item.stock <= 0) throw new GameError('OUT_OF_STOCK');
    if (player.balance < item.price) throw new GameError('INSUFFICIENT_FUNDS');

    // 2e. Execute atomically
    await tx.player.update({
      where: { id: playerId },
      data: { balance: { decrement: item.price } },
    });
    await tx.shopItem.update({
      where: { id: itemId },
      data: { stock: { decrement: 1 } },
    });
    await tx.inventory.create({
      data: { playerId, itemId, acquiredAt: new Date() },
    });

    // 2f. Audit log
    const result = await tx.purchaseLog.create({
      data: {
        idempotencyKey,
        playerId,
        itemId,
        amount: item.price,
        result: { success: true, newBalance: player.balance - item.price },
      },
    });

    return result;
  });
}
```

### Economy Invariant Check (automated)

```sql
-- Run periodically or after each transaction batch
-- Total currency in the system should be constant (minus system sinks + system sources)

SELECT
  (SELECT COALESCE(SUM(balance), 0) FROM players) AS total_player_currency,
  (SELECT COALESCE(SUM(amount), 0) FROM economy_ledger WHERE type = 'SYSTEM_MINT') AS total_minted,
  (SELECT COALESCE(SUM(amount), 0) FROM economy_ledger WHERE type = 'SYSTEM_SINK') AS total_sunk;

-- Invariant: total_player_currency = total_minted - total_sunk
-- Any deviation → critical alert
```

---

## 4. World Generation Patterns

### Seeded Sector Generation

```typescript
import { createHash } from 'crypto';

function generateSector(sectorX: number, sectorY: number, worldSeed: string): Tile[][] {
  // Deterministic seed per sector
  const sectorSeed = createHash('sha256')
    .update(`${worldSeed}-${sectorX}-${sectorY}`)
    .digest('hex');

  const rng = seedrandom(sectorSeed);
  const grid: Tile[][] = Array.from({ length: SECTOR_SIZE }, () =>
    Array.from({ length: SECTOR_SIZE }, () => ({ type: 'empty' as TileType }))
  );

  // 1. Generate streets (random walker or WFC)
  generateStreets(grid, rng);

  // 2. Place buildings on remaining tiles adjacent to streets
  placeBuildings(grid, rng);

  // 3. Fill remaining with decoration/borders
  fillBorders(grid);

  // 4. Validate connectivity
  if (!validateConnectivity(grid)) {
    // Regenerate with offset seed (never just retry same seed)
    return generateSector(sectorX, sectorY, worldSeed + '-retry');
  }

  return grid;
}
```

### Connectivity Validation (A* pathfinding)

```typescript
function validateConnectivity(grid: Tile[][]): boolean {
  const buildings = findTilesOfType(grid, 'building');
  const mainStreet = findFirstTileOfType(grid, 'street');

  if (!mainStreet) return false;

  // Every building must be reachable from the main street network
  for (const building of buildings) {
    const adjacent = getAdjacentTiles(grid, building);
    const hasStreetAccess = adjacent.some(t => t.type === 'street' || t.type === 'intersection');
    if (!hasStreetAccess) return false;
  }

  // All streets must form a connected graph
  const visited = new Set<string>();
  floodFill(grid, mainStreet, visited, ['street', 'intersection']);

  const allStreets = findTilesOfType(grid, 'street').concat(findTilesOfType(grid, 'intersection'));
  return allStreets.every(s => visited.has(`${s.x},${s.y}`));
}
```

### Border Alignment (cross-sector)

```typescript
// When generating a new sector, check neighboring sectors for border alignment
async function alignBorders(
  grid: Tile[][],
  sectorX: number,
  sectorY: number,
): Promise<void> {
  // Check each border direction
  const neighbors = [
    { dx: 0, dy: -1, edge: 'top', neighborEdge: 'bottom' },
    { dx: 0, dy: 1, edge: 'bottom', neighborEdge: 'top' },
    { dx: -1, dy: 0, edge: 'left', neighborEdge: 'right' },
    { dx: 1, dy: 0, edge: 'right', neighborEdge: 'left' },
  ];

  for (const neighbor of neighbors) {
    const existingSector = await db.sector.findUnique({
      where: { sectorX_sectorY: { sectorX: sectorX + neighbor.dx, sectorY: sectorY + neighbor.dy } },
    });

    if (existingSector) {
      // Align street connections at shared border
      const neighborBorderTiles = getBorderTiles(existingSector.tiles, neighbor.neighborEdge);
      const myBorderTiles = getBorderTiles(grid, neighbor.edge);

      // Where neighbor has street at border → ensure we also have street
      for (let i = 0; i < SECTOR_SIZE; i++) {
        if (neighborBorderTiles[i].type === 'street') {
          myBorderTiles[i].type = 'street';
        }
      }
    }
  }
}
```

---

## 5. Player State Machine

### Valid State Transitions

```
          ┌───────────────────────────────────────────┐
          │                                           │
          ▼                                           │
       ┌──────┐     move      ┌────────┐          cancel
       │ IDLE │──────────────►│ MOVING │───────────┤
       └──┬───┘               └────┬───┘           │
          │                        │ arrived       │
          │ start_training         ▼               │
          │                   ┌──────┐             │
          ├──────────────────►│ IDLE │◄────────────┘
          │                   └──────┘
          │ start_working         ▲
          │                       │ completed
          ▼                       │
       ┌──────────┐              │
       │ TRAINING │──────────────┘
       └──────────┘

       ┌──────────┐
       │ WORKING  │──────────────► IDLE (completed)
       └──────────┘

       ┌──────────┐
       │ FIGHTING │──────────────► IDLE (resolved)
       └──────────┘
```

**Rule:** Every state transition is validated server-side. The client can only request transitions, not execute them.

```typescript
const VALID_TRANSITIONS: Record<PlayerState, PlayerState[]> = {
  IDLE:      ['MOVING', 'TRAINING', 'WORKING', 'FIGHTING', 'RESTING'],
  MOVING:    ['IDLE'],           // only on arrival or cancel
  TRAINING:  ['IDLE'],           // only on completion or cancel
  WORKING:   ['IDLE'],           // only on completion or cancel
  FIGHTING:  ['IDLE'],           // only on resolution
  RESTING:   ['IDLE'],           // only on completion
};

function validateTransition(from: PlayerState, to: PlayerState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
```

---

## 6. Shared Package Structure

```
libs/shared/
├── types/
│   ├── player.ts          # Player, Gangster, Stats interfaces
│   ├── action.ts          # GameAction, ActionType, ActionStatus
│   ├── world.ts           # WorldPosition, Tile, Sector, TileType
│   ├── economy.ts         # Currency, Item, Trade, LedgerEntry
│   ├── combat.ts          # CombatResult, DamageCalc, etc.
│   └── index.ts           # Re-exports all types
├── schemas/
│   ├── player.schema.ts   # Zod schemas for player data
│   ├── action.schema.ts   # Zod schemas for action inputs
│   ├── world.schema.ts    # Zod schemas for coordinates/tiles
│   └── index.ts
├── constants/
│   ├── game.ts            # SECTOR_SIZE, MAX_PLAYERS, TICK_RATE, etc.
│   ├── timing.ts          # WALK_SPEED_MS, TRAINING_BASE_DURATION, etc.
│   └── index.ts
├── events/
│   └── socket-events.ts   # SocketEvents const (single source of truth)
└── utils/
    ├── position.ts        # Position helpers (distance, adjacency, pathfinding)
    ├── timing.ts          # Duration calculators (shared between client display + server logic)
    └── index.ts
```

**Rule:** Anything that both client and server need lives here. No duplication. Import from `@project/shared`.
