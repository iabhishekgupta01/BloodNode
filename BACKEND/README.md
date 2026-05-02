BloodNode Backend (Auth + User APIs)

Quick backend implementation (MVC) providing user-only authentication and basic user APIs.

Getting started

- Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
- Install dependencies and run:

```bash
npm install express mongoose bcryptjs jsonwebtoken dotenv cors morgan
npm install -D nodemon
npm run dev
```

If you don't set `MONGO_URI`, the server will start but DB operations will be skipped (useful for quick testing of auth routes if you mock or later connect).

APIs

- GET `/api` — Health/home endpoint

Auth
- POST `/api/auth/register`
  - Body (json): `{ "name": "Alice", "phone": "9999999999", "password": "pass123", "bloodGroup": "O-", "pincode": "560001", "city": "Bengaluru", "state": "Karnataka" }`
  - Response: `{ token, user }`

- POST `/api/auth/login`
  - Body: `{ "phone": "9999999999", "password": "pass123" }`
  - Response: `{ token, user }`

User (protected — send header `Authorization: Bearer <token>`)
- GET `/api/users/me` — get profile
- PUT `/api/users/me` — update profile fields (name, bloodGroup, status, donationsCount, lastDonated)
  - Body example: `{ "name": "Bob" }`
- PUT `/api/users/location` — update coordinates
  - Body: `{ "longitude": 77.5937, "latitude": 12.9716 }`

Testing with curl

Register:

```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","phone":"7000000000","password":"secret","pincode":"560001","city":"Bengaluru","state":"Karnataka"}'
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"phone":"7000000000","password":"secret"}'
```

Get profile (use token from login):

```bash
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/users/me
```

Notes
- Passwords are hashed with bcrypt.
- Tokens are JWTs signed with `JWT_SECRET`.
- This is a minimal starting implementation focused on user auth and simple APIs; expand validations, rate-limiting, and production hardening as needed.
