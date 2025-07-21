import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signup = async (email, password, username) => {
    try {
      // 기존 사용자 확인
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = existingUsers.find(user => user.email === email);
      
      if (existingUser) {
        throw new Error('이미 존재하는 이메일입니다.');
      }

      // 새 사용자 생성
      const newUser = {
        id: Date.now().toString(),
        email,
        username,
        createdAt: new Date().toISOString()
      };

      // 사용자 목록에 추가
      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      // 현재 사용자로 설정
      localStorage.setItem('user', JSON.stringify(newUser));
      setCurrentUser(newUser);
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      // 저장된 사용자 목록에서 확인
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('존재하지 않는 이메일입니다.');
      }

      // 테스트 계정 확인 (비밀번호 검증 생략)
      if (email === 'test@test.com' && password === '123456') {
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        return user;
      }

      // 일반 계정은 비밀번호 검증 없이 로그인 허용 (데모용)
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 