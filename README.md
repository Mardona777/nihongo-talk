# Nihongo Talk 🇯🇵

**Japanese Conversation Practice App**

Nihongo Talk is a web application designed to help users practice everyday Japanese conversation through scenario-based questions.

## ✨ Features

* 🔐 User registration and login
* 🎯 Scenario-based Japanese conversation practice
* 💬 5 conversation scenarios
* 🎲 Random conversation questions
* 📝 20 questions per conversation session
* 🌐 Japanese questions with English translations
* 📚 Expected answers for conversation practice
* 💻 Responsive and simple user interface

## 🎭 Conversation Scenarios

The application currently includes 5 scenarios:

1. **Self Introduction** — 自己紹介
2. **Shopping** — 買い物
3. **Restaurant** — レストラン
4. **Train Station** — 駅
5. **Job Interview** — 面接

Each scenario provides 20 questions for the conversation practice session.

## 🛠️ Technologies

### Frontend

* React
* Vite
* JavaScript
* CSS
* React Router

### Backend

* Node.js
* Express.js
* REST API
* CORS
* bcrypt

## 📁 Project Structure

```text
nihongo-talk/
│
├── backend/
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── package.json
└── package-lock.json
```

## 🚀 How to Run

### 1. Clone the repository

```bash
git clone https://github.com/Mardona777/nihongo-talk.git
cd nihongo-talk
```

### 2. Install dependencies

Install the root dependencies:

```bash
npm install
```

Then install frontend dependencies:

```bash
cd frontend
npm install
```

Go back to the root folder:

```bash
cd ..
```

Install backend dependencies:

```bash
cd backend
npm install
```

### 3. Start the Backend

Inside the `backend` folder:

```bash
node server.js
```

The backend server will run locally.

### 4. Start the Frontend

Open another terminal and go to the frontend folder:

```bash
cd frontend
npm run dev
```

Vite will provide a local development URL, usually:

```text
http://localhost:5173
```

Open the URL in your browser.

## 💬 Conversation Flow

The typical user flow is:

```text
Home
  ↓
Register / Login
  ↓
Dashboard
  ↓
Select a Scenario
  ↓
Conversation
  ↓
20 Random Questions
```

## 🎯 Current Version

The current version focuses on the core conversation practice functionality.

* 5 scenarios
* 20 questions per session
* Random question selection
* Authentication
* Frontend and backend integration

A larger question bank can be integrated in a future version.

## 🔮 Future Improvements

Possible future improvements include:

* Larger question database
* JLPT-level filtering
* Japanese pronunciation/audio
* Speech recognition
* AI-powered conversation feedback
* User progress tracking
* Conversation history
* More scenarios
* More Japanese questions

## 👩‍💻 Project

**Nihongo Talk — Japanese Conversation Practice App**

Created as a Japanese language learning web application project.
