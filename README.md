# 🌐 TawKio  

TawKio is a **social media application** built with modern web technologies.  
Users can **post, like, comment, and chat** in real-time with future support for **video calls and notifications**.  

Live App: https://tawkio-socialmedia.vercel.app/

---

## 🚀 Tech Stack  

**Frontend**:  
- React (Vite)  
- TypeScript  
- Redux Toolkit  
- Tailwind CSS  
- shadcn/ui + lucide-react  

**Backend**:  
- Node.js + Express.js  
- Prisma ORM  
- Nodemailer  
- Cloudinary  

**Database**:  
- PostgreSQL (Docker or Supabase)  

**Deployment**:  
- Vercel → Frontend  
- Render → Backend  
- Supabase → Database  

---

## 📦 Getting Started  

### 1️⃣ Clone the Repository  

```bash
git clone [https://github.com/HimansuRanjan/TawKio.git]
cd tawkio
```
### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Your app will be running at http://localhost:5173

### 🗄️ Database Setup

Option 1: Local Postgres with Docker

Start the database:

```bash
docker-compose up -d
```

Update backend/.env:

```bash
DATABASE_URL="postgresql://bloguser:blogpass@localhost:5434/blogdb?schema=public"
```

Option 2: Supabase (Hosted Postgres)

Create a project in Supabase
Copy the connection string
Paste it into backend/.env

### 🔑 Environment Variables
Backend → backend/.env
```bash
DATABASE_URL=your_postgres_connection_string

PORT=4000

JWT_SECRET=your_jwt_secret
COOKIE_EXPIRES=10
JWT_EXPIRES=10d 

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLOUDINARY_EMAIL=your_cloudinary_email

# Email (Nodemailer)
SMTP_HOST=host
SMTP_PORT=port
SMTP_SERVICE=gmail
SMTP_MAIL=sender_gmail
SMTP_PASSWORD=smtp_password

APP_URL=http://localhost:5173
```
### 🛠️ Development Workflow

Run backend → npm run dev

Run frontend → npm run dev

Run Prisma migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 🤝 Contributing

Contributions are welcome!
Fork the repo and open a pull request 🚀
