# Dự án Du Học - Quản lý & Tư vấn

## Tổng quan

Dự án gồm 2 phần chính:
- **Backend**: Node.js (Express, Sequelize, PostgreSQL, JWT, RBAC, bảo mật, seed dữ liệu)
- **Frontend**: Nuxt 4 (Vue 3, SSR, Middleware, Auth, UI quản trị)

---

## Backend
- **Thư mục:** `backend/`
- **Ngôn ngữ:** Node.js (ESM)
- **Framework:** Express 5
- **ORM:** Sequelize (PostgreSQL)
- **Bảo mật:** JWT, HttpOnly Cookie, Helmet, Rate Limit, CORS
- **Xác thực:** RBAC, bcrypt, JWT, cookie-parser
- **Tiện ích:** dotenv, winston, morgan, faker
- **Kiểm thử & Dev:** nodemon, eslint, prettier
- **Scripts:**
  - `npm run dev` — Chạy server dev với nodemon
  - `npm start` — Chạy server production
  - `npm run lint` — Fix code style
- **Cài đặt:**
  1. `cd backend`
  2. `npm install`
  3. Tạo file `.env` từ `.env.example` và chỉnh thông tin DB, JWT
  4. `npm run dev`
- **Các package chính:**
  - express, sequelize, pg, bcrypt, jsonwebtoken, cors, helmet, express-rate-limit, winston, morgan, dotenv, cookie-parser, @faker-js/faker

---

## Frontend
- **Thư mục:** `frontend/`
- **Ngôn ngữ:** Vue 3 (Nuxt 4)
- **Framework:** Nuxt 4 (SSR, Vite)
- **Router:** vue-router
- **Xác thực:** Middleware bảo vệ route, Auth với HttpOnly cookie
- **Scripts:**
  - `npm run dev` — Chạy dev server (mặc định port 3000, có thể đổi)
  - `npm run build` — Build production
  - `npm run generate` — Generate static
  - `npm run preview` — Preview build
- **Cài đặt:**
  1. `cd frontend`
  2. `npm install`
  3. `npm run dev`
- **Các package chính:**
  - nuxt, vue, vue-router

---

## Hướng dẫn phát triển
- Chạy đồng thời backend và frontend ở 2 terminal khác nhau.
- Đảm bảo cấu hình proxy API trong Nuxt để chuyển tiếp `/api` sang backend.
- Đăng nhập sử dụng HttpOnly cookie, bảo vệ route bằng middleware.
- Seed dữ liệu mẫu bằng các script trong backend nếu cần.

---

## Tác giả & Giấy phép
- **Tác giả:** Anh Pham
- **License:** ISC
