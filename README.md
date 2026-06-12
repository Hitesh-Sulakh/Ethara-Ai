# 📦 Ethara AI — Inventory & Order Management System

A production-ready, containerized full-stack application for managing products, customers, and orders with real-time inventory tracking.

Built by **Ethara AI** — India's leading AI and data services company.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.11 · FastAPI · SQLAlchemy 2.0 |
| **Frontend** | React 18 · Vite · Axios · React Router v6 |
| **Database** | PostgreSQL 16 |
| **Containerization** | Docker · Docker Compose |
| **Frontend Server** | Nginx (Alpine) |

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/Ethara-Ai.git
cd Ethara-Ai
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env if you want to change default credentials
```

### 3. Build and run
```bash
docker-compose up --build -d
```

### 4. Access the application
| Service | URL |
|---|---|
| **Frontend** | [http://localhost:3000](http://localhost:3000) |
| **Backend API** | [http://localhost:8000](http://localhost:8000) |
| **API Docs (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **Health Check** | [http://localhost:8000/api/health](http://localhost:8000/api/health) |

---

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── config.py         # Environment configuration
│   │   ├── database.py       # SQLAlchemy setup
│   │   ├── models.py         # ORM models
│   │   ├── schemas.py        # Pydantic schemas
│   │   └── routers/
│   │       ├── products.py   # Product CRUD
│   │       ├── customers.py  # Customer CRUD
│   │       ├── orders.py     # Order CRUD + stock mgmt
│   │       └── dashboard.py  # Dashboard summary
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page-level components
│   │   ├── services/         # API service layer
│   │   └── styles/           # CSS modules
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📋 API Endpoints

### Products
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/products/` | Create a product |
| `GET` | `/api/products/` | List all products |
| `GET` | `/api/products/{id}` | Get product by ID |
| `PUT` | `/api/products/{id}` | Update product |
| `DELETE` | `/api/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/customers/` | Create a customer |
| `GET` | `/api/customers/` | List all customers |
| `GET` | `/api/customers/{id}` | Get customer by ID |
| `DELETE` | `/api/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/orders/` | Create an order (auto stock reduction) |
| `GET` | `/api/orders/` | List all orders |
| `GET` | `/api/orders/{id}` | Get order details |
| `DELETE` | `/api/orders/{id}` | Cancel order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Aggregate stats + low-stock alerts |

---

## ⚙️ Business Logic

- ✅ **Unique SKU** — Product codes must be unique
- ✅ **Unique Email** — Customer emails must be unique
- ✅ **Non-negative Stock** — Product quantity cannot go below 0
- ✅ **Stock Validation** — Orders rejected if insufficient inventory
- ✅ **Auto Stock Reduction** — Creating orders reduces product stock
- ✅ **Auto Stock Restoration** — Cancelling orders restores product stock
- ✅ **Server-side Totals** — Order totals computed automatically
- ✅ **Input Validation** — All requests validated with proper error codes

---

## 🐳 Docker Details

### Services
| Service | Image | Port |
|---|---|---|
| `db` | `postgres:16-alpine` | 5432 |
| `backend` | Custom (python:3.11-slim) | 8000 |
| `frontend` | Custom (node:20-alpine → nginx:alpine) | 3000 |

### Useful Commands
```bash
# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v

# Rebuild a single service
docker-compose build backend
```

---

## 🌐 Deployment

### Backend → Render
1. Push backend Docker image to Docker Hub
2. Create a **Web Service** on Render from the Docker image
3. Add a **PostgreSQL** database on Render
4. Set `DATABASE_URL` and `CORS_ORIGINS` environment variables

### Frontend → Vercel
1. Connect GitHub repository to Vercel
2. Set root directory to `frontend`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add `VITE_API_URL` environment variable pointing to deployed backend

---

## 🔗 Live URLs

| Service | URL |
|---|---|
| **Frontend** | [https://frontend-6jb8hqsln-hitesh2233.vercel.app](https://frontend-6jb8hqsln-hitesh2233.vercel.app) |
| **Backend API** | [https://ethara-ai-backend-nsvb.onrender.com](https://ethara-ai-backend-nsvb.onrender.com) |
| **API Docs** | [https://ethara-ai-backend-nsvb.onrender.com/docs](https://ethara-ai-backend-nsvb.onrender.com/docs) |
| **Docker Hub Image** | [https://hub.docker.com/r/hiteshsulakh/ethara-ai-backend](https://hub.docker.com/r/hiteshsulakh/ethara-ai-backend) |

---

## ⚠️ Manual Deployment (no CI)

If you prefer to deploy manually without using GitHub Actions, follow these exact steps.

### 1) Build & push backend Docker image to Docker Hub
Replace `hiteshsulakh` with your Docker Hub username if different.
```bash
# from project root
docker build -t hiteshsulakh/ethara-ai-backend:latest ./backend
docker login --username hiteshsulakh
docker push hiteshsulakh/ethara-ai-backend:latest
```

### 2) Create a Postgres database on Render (optional)
You can use Render Managed Postgres or supply an external Postgres URL.
On Render dashboard: New → Databases → PostgreSQL → choose plan (free) → create.
Copy the provided connection string (format: `postgres://user:pass@host:port/dbname`).

### 3) Deploy backend on Render from Docker Hub image
1. Log in to https://dashboard.render.com
2. Click **New → Web Service**
3. Choose **Private Docker Image (Docker Hub)** or the option to deploy from an image
4. Enter the image name: `hiteshsulakh/ethara-ai-backend:latest`
5. Set the **Start Command** (if Render asks): `uvicorn app.main:app --host 0.0.0.0 --port 8000`
6. Add environment variables under **Environment**:
	- `DATABASE_URL` = the Postgres connection string from step 2 (or your existing DB)
	- `CORS_ORIGINS` = `http://localhost:3000,http://localhost:5173` or your frontend URL
7. Set the **Health Check Path** to `/api/health` and port to `8000` if requested.
8. Create the service — Render will pull the image and start the container.

### 4) Deploy frontend to Vercel (manual)
Install Vercel CLI and deploy from the `frontend` folder.
```bash
cd frontend
npm ci
npm run build
# login (interactive) or use --token
vercel login
vercel --prod --confirm
```
During the deploy, set `VITE_API_URL` to your Render backend URL (e.g. `https://ethara-ai-pnpi.onrender.com`).

### 5) Verify
- Backend health:
```bash
curl -sS https://<YOUR_RENDER_URL>/api/health | jq
```
- Frontend: open the Vercel URL in a browser and verify features (Products, Customers, Orders) work and API calls succeed.

### Notes & troubleshooting
- If Render fails to pull the image, ensure the image is public or provide Docker Hub credentials in Render when using a private image.
- If the backend cannot connect to Postgres, re-check `DATABASE_URL` and network/access rules.
- If CORS errors appear in the browser console, add your frontend origin to `CORS_ORIGINS`.


## 📄 License

This project is part of the Ethara AI technical assessment.

Built with ❤️ by **Ethara AI** — Bridging AI and Data Excellence.
