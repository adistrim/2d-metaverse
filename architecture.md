# 2d-metaverse project

My first project focused on test driven development (TDD)

Focus would on mono-repos, micro-services, websockets, WebRTC

## Architecture

`What is the goal?`

If a character is in a room, it should be able to see other characters in the
room and their movements in real-time and vice versa.

This could be achieved by using websocket.

Whenever someone joins a room, the server should broadcast the new character to
all the other characters in the room. [Stickey Connection]()

We will need

1. A [websocket server](#websocket-schema)
2. [HTTP server](#http-server) to serve the client
3. [Database](SCHEMA) to store the data

## HTTP Server

### API Design

1. POST /api/v1/signup

```json
{
    "username": "username",
    "password": "password",
    "type": "admin" // or "user"
}
```

Return Status code 200 if successful, 400 if username already exists
<br> `admin` type user can create maps, elements, etc. `user` type can create
rooms only.

2. POST /api/v1/signin

```json
{
    "username": "username",
    "password": "password"
}
```

Returns a token if successful, 400 if username or password is incorrect

```json
{
    "token": "token"
}
```

3. Update Metadata - POST /api/v1/user/metadata

```json
{
    "token": "token",
    "metadata": {
        "avatarId": "123"
    }
}
```

Returns 200 if successful, 400 if token is invalid

4. Get available avatars - GET /api/v1/avatars

```json
{
    "avatars": [{
        "id": "123",
        "name": "avatar1",
        "url": "https://example.com/avatar1.png"
    }]
}
```

5. Get other users metadata (name and avatarUrl)

GET /api/v1/user/metadata/bulk?id=[1, 3, 55]

Returns

```json
{
    "avatars": [{
        "userId": 1,
        "imageUrl": "https://example.com/cat.png"
    }, {
        "userId": 3,
        "imageUrl": "https://example.com/dog.png"
    }, {
        "userId": 55,
        "imageUrl": "https://example.com/pikachu.png"
    },]
}
```

6. Space Dashboard - `Create a Space` - POST /api/v1/space

```json
{
    "name": "Space Name",
    "dimensions": "100x200",
    "mapId": "map1"
}
```

7. Delete a Space - DELETE /api/v1/space/:spaceId

Returns 200 if successful, 400 if spaceId is invalid

8. Get all existing spaces - GET /api/v1/space/all

```json
{
    "spaces": [{
        "name": "Space Name",
        "dimensions": "100x200",
        "thumbnail": "https://example.com/thumbnail.png"
    }, {
        "name": "Space Name",
        "dimensions": "100x200",
        "thumbnail": "https://example.com/thumbnail.png"
    }]
}
```

9. Arena - Get a space - GET /api/v1/space/:spaceId

Returns

```json
{
    "dimensions": "100x200",
    "elements": [{
        "id": 1,
        "element": {
            "id": "chair1",
            "imageUrl": "https://example.com/chair1.png",
            "static": false
        },
        "x": 20,
        "y": 20
    }, {
        "id": 2,
        "element": {
            "id": "chair2",
            "imageUrl": "https://example.com/chair2.png",
            "static": false
        },
        "x": 18,
        "y": 20
    }, {
        "id": 3,
        "element": {
            "id": "table1",
            "imageUrl": "https://example.com/table1.png",
            "static": true
        },
        "x": 22,
        "y": 22
    }]
}
```

10. Add an Element - POST /api/v1/space/element

```json
{
    "elementId": "chair1",
    "spaceId": "123",
    "x": 50,
    "y": 20
}
```

11. Delete an Element - DELETE /api/v1/space/element

```json
{
    "spaceId": "123",
    "elementId": "1" // element id within the context of the space
}
```

12. See all elements in a space - GET /api/v1/elements

```json
{
    "elements": [{
        "id": "chair1",
        "imageUrl": "https://example.com/chair1.png",
        "x": 20,
        "y": 20
    }, {
        "id": "chair2",
        "imageUrl": "https://example.com/chair2.png",
        "x": 18,
        "y": 20
    }, {
        "id": "table1",
        "imageUrl": "https://example.com/table1.png",
        "x": 22,
        "y": 22
    }]
}
```

13. Admin/Map Creator - Create an element - POST /api/v1/admin/element

```json
{
    "imageUrl": "https://example.com/something.png",
    "width": 1,
    "height": 1,
    "static": true // weather or not the user can sit on top of this element
}
```

14. Update an element - PUT /api/v1/admin/element/:elementId
(Can't update dimension once created)
```json
{
    "imageUrl": "https://example.com/something.png"
}
````

15. Create an avater - POST /api/v1/admin/avatar

```json
{
    "imageUrl": "https://example.com/something.png"
}
```

Returns

```json
{
    "avatarId": "123"
}
```

16. Create a map - POST /api/v1/admin/map

```json
{
    "thumbnail": "https://thumbnail.com/a.png",
    "dimension": "100x200",
    "defaultElements": [{
        "elementsId": "chair1",
        "x": 20,
        "y": 20
    }, {
        "elementsId": "chair2",
        "x": 18,
        "y": 20
    }, {
        "elementsId": "table1",
        "x": 22,
        "y": 20
    }, {
        "elementsId": "table2",
        "x": 20,
        "y": 22
    }]
}
```

All authentication endpoints should be hit with an Aurthorization header

```json
"authorization": "Bearer token_received_after_signin"
```

## Websocket Schema

### Client Sent events

1. Join a space

```json
{
    "type": "join",
    "payload": {
        "spaceId": "123",
        "token": "token_received_during_signin"
    }
}
```

2. Movement

```json
{
    "type": "move",
    "payload": {
        "x": 2,
        "y": 3
    }
}
```

### Server sent events

1. Space Joined

```json
{
    "type": "space-joined",
    "payload": {
        "spawn": {
            "x": 2,
            "y": 3
        },
        "users": [{
            "id": 1,
        }]
    }
}
```

2. Movement Rejected - race condition

Sent if the server found a collision and prevented you from moving to a block.
It'll return you back x, y of where you should be pushed back to.

Used for cases like:

    2.1. User moves beyond the wall
    2.2. User collided with a different user
    2.3. User tried to sit on a element that is static

```json
{
    "type": "movement-rejected",
    "payload": {
        "x": 2,
        "y": 3
    }
}
```

3. Movement

```json
{
    "type": "movement",
    "payload": {
        "x": 1,
        "y": 2,
        "userId": "123"
    }
}
```

4. Leave

```json
{
    "type": "user-left",
    "payload": {
        "userId": 1
    }
}
```
