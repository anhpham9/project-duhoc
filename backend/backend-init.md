

```BASH
cd backend
npm init -y
npm install express bcrypt cors sequelize pg pg-hstore jsonwebtoken helmet winston morgan dotenv cookie-parser joi concurrently
npm install @faker-js/faker
npm install -D nodemon
npm install -D eslint
npm install -D prettier
```

### 📦 Dependencies

* express → server
* bcrypt → hash password
* cors → CORS
* sequelize + pg → DB
* jsonwebtoken → auth
* helmet → security
* winston → logging
* morgan → HTTP log
* dotenv → env
* cookie-parser → cookie
* joi → validation
* concurrently → chạy nhiều service

### 🛠️ Dev dependencies

* nodemon → dev server

### 🔹 1. Sửa package.json

Trong package.json:

```JSON
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

### 🔹 2. Tạo cấu trúc tối thiểu

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js   ← Login, Refresh, Logout ở đây
│   │   │   ├── auth.service.js      ← xử lý DB token
│   │   │   ├── auth.routes.js       ← định nghĩa API
│   │   │   
│   │   ├── users/
│   │   │   ├── user.controller.js   ← nhận request
│   │   │   ├── user.service.js      ← xử lý business
│   │   │   ├── user.repository.js   ← query DB
│   │   │   ├── user.routes.js       ← định nghĩa API
│   │   │   ├── user.validation.js   ← validation
│   │   │   ├── user.model.js        ← schema
│   │   ├── roles/
│   │   ├── permissions/
│   │   
│   ├── middlewares/
│   │   ├── auth.middleware.js       ← check access token
│   │   ├── rbac.middleware.js       ← check permission
│   │   
│   ├── utils/
│   │   ├── jwt.js                   ← generate/verify token
│   │   
│   ├── db/
│   │   ├── index.js     
│   ├── app.js
│   └── server.js
├── .env
```

### 🔹 3. server.js

```JavaScript
import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 🔹 4. app.js

```JavaScript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

export default app;
```

### 🔹 5. .env

```env
PORT=5000
JWT_SECRET=your_secret
DATABASE_URL=postgres://user:pass@localhost:5432/db
```

### 🔹 6. Frontend

👉 Khi gọi API phải có:

```JavaScript
fetch("http://localhost:5000/api/auth/me", {
  credentials: "include",
});
```

hoặc axios:

```JavaScript
axios.get("/api/auth/me", {
  withCredentials: true,
});
```