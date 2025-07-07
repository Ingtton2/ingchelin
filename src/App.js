import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FavoriteProvider } from './context/FavoriteContext';
import { VisitProvider } from './context/VisitContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RestaurantList from './pages/RestaurantList';
import KakaoMap from './pages/Map';
import RandomRecommendation from './pages/RandomRecommendation';
import Favorites from './pages/Favorites';
import './App.css';

// 보호된 라우트 컴포넌트
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function AppContent() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/restaurants" 
            element={
              <ProtectedRoute>
                <RestaurantList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/map" 
            element={
              <ProtectedRoute>
                <KakaoMap />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/random" 
            element={
              <ProtectedRoute>
                <RandomRecommendation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/favorites" 
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <FavoriteProvider>
        <VisitProvider>
          <AppContent />
        </VisitProvider>
      </FavoriteProvider>
    </AuthProvider>
  );
}

export default App;
