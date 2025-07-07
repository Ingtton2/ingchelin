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

  const signup = (email, password, username) => {
    // 실제로는 서버에 회원가입 요청을 보내야 합니다
    const newUser = {
      id: Date.now(),
      email,
      username,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('user', JSON.stringify(newUser));
    setCurrentUser(newUser);
    return Promise.resolve(newUser);
  };

  const login = (email, password) => {
    // 실제로는 서버에 로그인 요청을 보내야 합니다
    // 여기서는 간단한 시뮬레이션을 위해 하드코딩된 사용자 정보를 사용합니다
    const mockUsers = [
      { id: 1, email: 'test@test.com', password: '123456', username: '테스트사용자' },
      { id: 2, email: 'user@user.com', password: '123456', username: '일반사용자' }
    ];

    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setCurrentUser(userWithoutPassword);
      return Promise.resolve(userWithoutPassword);
    } else {
      return Promise.reject(new Error('이메일 또는 비밀번호가 잘못되었습니다.'));
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