# Smart Food Donation and Waste Management (FoodBridge) 🍲🌱

A full-stack web application aimed at minimizing food waste by connecting food donors (individuals, restaurants, event organizers) directly with verified NGOs and volunteers in real-time. This platform ensures surplus food reaches those in need before it spoils.

## 🚀 Features

- **Role-Based Access Control:** Secure registration and login for both **Donors** and **NGOs** using JWT authentication.
- **Smart Rescue Queue Map:** An interactive, real-time map built with React-Leaflet. It intelligently displays:
  - 🏠 **Blue Home Markers:** Your NGO's registered center.
  - 🚨 **Red Alert Markers:** Critical food donations nearing expiry.
  - 🍔 **Orange Food Markers:** Standard, safe-to-consume food donations.
- **Geolocation Integration:** Automatically captures the donor's exact location to calculate distances, with graceful fallbacks.
- **Impact & Urgency Algorithms:** Calculates the distance from NGOs, estimates meals saved, tracks CO2 avoided, and evaluates food safety/expiry risks dynamically.
- **Automated Notifications:** Sends automated email alerts via Nodemailer when a donation is accepted or nearing critical expiry.
- **Secure Image Uploads:** Cloudinary integration for capturing visual proof of food quality.

## 💻 Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, React-Leaflet, Axios, Lucide-React
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **Services:** Cloudinary (Images), Nodemailer (Emails)

## ⚙️ How It Works

1. **Donors Post Surplus Food:** A donor logs in, captures their location, and fills out details about the surplus food (quantity, expiry time, type, storage instructions, and photos). 
2. **Safety & Risk Assessment:** The system runs a safety check, calculating a "Risk Score" based on food type and expiry time.
3. **NGOs Receive Live Alerts:** NGOs view a Live Map (Smart Rescue Queue) centered around their organization. They can see nearby donations plotted by priority. 
4. **Accept & Rescue:** The NGO accepts the donation on the platform. The donor instantly receives an email notification.
5. **Collection & Impact Verification:** Once the food is collected, the NGO verifies with a PIN. The system then generates a sharable "Impact Card" detailing meals saved and CO2 emissions avoided.

## 🛠️ Local Development Setup

### Prerequisites
- Node.js installed on your system
- MongoDB (local or Atlas cluster)
- Cloudinary Account (for image uploads)

### 1. Clone the Repository
```bash
git clone https://github.com/414tanu/smart-Food-Donation.git
cd smart-Food-Donation
```

### 2. Backend Setup
Navigate into the `server` directory and install dependencies:
```bash
cd server
npm install
```
Create a `.env` file in the `server` folder with the following credentials:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodbridge
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=tanujbrt@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URLS=http://localhost:5173,http://127.0.0.1:5173
```
Start the backend server:
```bash
npm run start
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
Open a new terminal, navigate to the `client` directory, and install dependencies:
```bash
cd client
npm install
```
Create a `.env` file in the `client` folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=FoodBridge
```
Start the frontend development server:
```bash
npm run dev
# App runs on http://localhost:5173
```

## 👨‍💻 Developed By

**Tanuj**
- GitHub: [414tanu](https://github.com/414tanu)
- Email: [tanujbrt@gmail.com](mailto:tanujbrt@gmail.com)

---
*Built with ❤️ to fight hunger and reduce global food waste.*
