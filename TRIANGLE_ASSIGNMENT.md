# Triangle Assignment Logic

This document explains the implementation of the triangle assignment logic in ForgeChain Networks.

## Overview

When a new user joins the platform and their deposit is confirmed by an admin, they are assigned to a position in a triangle based on the following rules:

1. **Referral Priority**: If the user was referred by an existing user, they join the same triangle as their referrer (if available and of the same plan)
2. **Plan Matching**: Users can only join triangles of the same plan type as their deposit
3. **First-Come, First-Served**: Positions within triangles are assigned on a first-come, first-served basis
4. **Oldest Triangle Priority**: If no referral match is possible, users are assigned to the oldest available triangle of their plan type
5. **New Triangle Creation**: If no available triangles exist for a plan type, a new triangle is created

## Implementation Details

### API Endpoint

A new API endpoint has been created to handle triangle assignment:

```
POST /api/triangle/assign
```

This endpoint:
- Verifies admin authentication
- Finds or creates an appropriate triangle for a user
- Assigns the user to the next available position
- Updates the user's record with their triangle position information

### Assignment Algorithm

The assignment algorithm follows these steps:

1. **Check for Referral Placement**:
   - If the user has an upline (referrer), check if the upline has an incomplete triangle
   - If so, and the triangle is of the same plan type, place the user in that triangle
   - Return the assigned position if successful

2. **Find Oldest Available Triangle**:
   - Query for incomplete triangles of the user's plan type that have available positions
   - Sort by creation date (oldest first)
   - Try to assign the user to each triangle until successful

3. **Create New Triangle**:
   - If no suitable existing triangle is found, create a new triangle
   - Assign the user to position 0 of the new triangle

### Integration with Transaction Confirmation

When an admin confirms a deposit transaction:
1. The transaction status is updated to "CONFIRMED"
2. The triangle assignment API is called to place the user in a triangle
3. If the user has a referrer, a referral bonus transaction is created
4. The referrer's balance is updated with the bonus amount

## Data Models

### Triangle Model

```prisma
model Triangle {
  id             String     @id @default(auto()) @map("_id") @db.ObjectId
  positions      Position[]
  planType       PlanType
  completedAt    DateTime?  @db.Date
  payoutProcessed Boolean    @default(false)
  createdAt      DateTime   @default(now()) @db.Date
  updatedAt      DateTime   @updatedAt @db.Date
}
```

### Position Model

```prisma
model Position {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  userId     String?  @db.ObjectId
  triangleId String   @db.ObjectId
  position   Int
  user       User?    @relation(fields: [userId], references: [id])
  triangle   Triangle @relation(fields: [triangleId], references: [id])
  createdAt  DateTime @default(now()) @db.Date
  updatedAt  DateTime @updatedAt @db.Date

  @@unique([triangleId, position])
}
```

## API Usage

### Assign User to Triangle

```bash
curl -X POST http://localhost:3000/api/triangle/assign \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"userId": "user-id-here"}'
```

Response:
```json
{
  "success": true,
  "message": "User successfully assigned to triangle",
  "position": {
    "id": "position-id",
    "position": 3,
    "triangleId": "triangle-id"
  }
}
```

## Error Handling

The system handles the following error cases:
- Invalid user ID
- User not found
- Database connection errors
- Authentication failures
- No available positions in any triangle

In all error cases, appropriate HTTP status codes and error messages are returned.

## Future Improvements

Potential enhancements to the triangle assignment system:
1. **Load Balancing**: Distribute users more evenly across triangles
2. **Geographic Proximity**: Consider user location when assigning to triangles
3. **Performance Optimization**: Implement caching for frequently accessed triangles
4. **Batch Assignment**: Process multiple user assignments in a single transaction