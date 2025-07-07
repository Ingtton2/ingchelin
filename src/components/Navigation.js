import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

function Navigation() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          <span className="nav-logo-icon">🍽️</span>
          <span>인슐랭 맛집 가이드</span>
        </Link>
        
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        <ul className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              🏠 홈
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/restaurants" 
              className={`nav-link ${isActive('/restaurants') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              📋 맛집 목록
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/map" 
              className={`nav-link ${isActive('/map') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              🗺️ 지도
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/random" 
              className={`nav-link ${isActive('/random') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              🎲 랜덤 추천
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/favorites" 
              className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              ❤️ 내 찜 목록
            </Link>
          </li>

          <div className="user-menu">
            {currentUser ? (
              <div className="user-info">
                <div className="user-avatar">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">안녕하세요, {currentUser.username}님!</span>
              </div>
            ) : null}
            
            {currentUser ? (
              <button onClick={handleLogout} className="auth-btn logout">
                🚪 로그아웃
              </button>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="auth-btn login" onClick={closeMobileMenu}>
                  🔑 로그인
                </Link>
                <Link to="/signup" className="auth-btn signup" onClick={closeMobileMenu}>
                  ✍️ 회원가입
                </Link>
              </div>
            )}
          </div>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation; 