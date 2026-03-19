# PriceOrbit 🛒

> A full-stack price comparison web app for the Indian market — track prices across Amazon and Flipkart, set alerts, and never miss a deal.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-brightgreen?logo=springboot)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![Java](https://img.shields.io/badge/Java-17-orange?logo=java)
![JWT](https://img.shields.io/badge/Auth-JWT-yellow)

---

## What is PriceOrbit?

PriceOrbit helps Indian shoppers compare product prices between **Amazon** and **Flipkart** in one place. Users can track price history, save products, set price drop alerts, and discover trending deals — all in a clean, modern interface.

---

## Screenshots

### Home Page
![Home](screenshots/home.png)

### Search Results — Amazon vs Flipkart
![Results](screenshots/results.png)

### Deals Page
![Deals](screenshots/deals.png)

### Saved Products
![Saved](screenshots/saved.png)

### Price Alerts
![Alerts](screenshots/alerts.png)

---

## Features

### Search & Compare
- Search products across Amazon and Flipkart simultaneously
- Side-by-side price comparison with retailer badges
- Product detail page with full specifications

### Price History
- Visual price history chart powered by Recharts
- Track how prices have changed over time
- Know the best time to buy

### Price Alerts
- Set a target price for any product
- Backend checks prices and triggers alerts automatically
- Manage all your alerts from a dedicated page

### Authentication
- Secure register and login with JWT tokens
- BCrypt password hashing
- Protected routes — saved items and alerts require login

### Discover
- **Deals page** — products with the biggest price drops
- **Trending page** — most searched and viewed products
- **Saved page** — bookmark products for later

### Profile
- View and update your account details
- See your saved products and active alerts in one place

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| React Router | Page navigation |
| Recharts | Price history charts |
| CSS3 | Styling with blue theme |

### Backend
| Technology | Purpose |
|------------|---------|
| Java 17 | Programming language |
| Spring Boot 3 | Backend framework |
| Spring Security | Authentication & authorization |
| JJWT | JSON Web Token generation |
| Lombok | Reducing boilerplate code |
| Maven | Dependency management |

### Database & APIs
| Technology | Purpose |
|------------|---------|
| MongoDB Atlas | Cloud NoSQL database |
| RapidAPI PriceScout | Live Amazon & Flipkart price data |

---

## Project Structure
```
PriceOrbit/
├── screenshots/               # App screenshots
├── frontend/                  # React 18 app
│   ├── public/
│   └── src/
│       ├── components/        # Navbar, Footer, SearchBar, etc.
│       ├── pages/             # Home, Results, Deals, Trending, etc.
│       └── config.js          # API base URL config
│
└── backend/                   # Spring Boot app
    └── src/main/java/com/priceorbit/
        ├── controller/        # REST API endpoints
        ├── service/           # Business logic
        ├── model/             # MongoDB document models
        ├── repository/        # MongoDB repositories
        └── config/            # Security & CORS config
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/search?q={query}` | Search products |
| GET | `/api/products/{id}` | Get product details |
| GET | `/api/products/deals` | Get current deals |
| GET | `/api/products/trending` | Get trending products |

### User (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| POST | `/api/users/saved/{productId}` | Save a product |
| DELETE | `/api/users/saved/{productId}` | Remove saved product |

### Alerts (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | Get user's alerts |
| POST | `/api/alerts` | Create price alert |
| DELETE | `/api/alerts/{id}` | Delete alert |

---

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MongoDB Atlas account
- Maven

### 1. Clone the repository
```bash
git clone https://github.com/Mohamedjasick/PriceOrbit.git
cd PriceOrbit
```

### 2. Configure the backend
```bash
cd backend/src/main/resources
cp application.properties.example application.properties
```
Fill in your values in `application.properties`:
```properties
spring.data.mongodb.uri=your_mongodb_uri
jwt.secret=your_jwt_secret
rapidapi.key=your_rapidapi_key
```

### 3. Run the backend
```bash
cd backend
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### 4. Run the frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## Roadmap

- [x] JWT Authentication
- [x] Product search (Amazon + Flipkart)
- [x] Price history charts
- [x] Price drop alerts
- [x] Saved products
- [x] Trending & Deals pages
- [ ] Live deployment
- [ ] RapidAPI live integration (quota reset pending)
- [ ] Email notifications for alerts

---

## Author

**Mohamed Jasick**
GitHub: [@Mohamedjasick](https://github.com/Mohamedjasick)

---

## License

This project is open source and available under the [MIT License](LICENSE).


