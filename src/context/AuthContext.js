import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

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
      // Supabase에서 기존 사용자 확인
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);
      
      if (checkError) {
        console.error('사용자 확인 오류:', checkError);
        throw new Error('사용자 확인 중 오류가 발생했습니다.');
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('이미 존재하는 이메일입니다.');
      }

      // 새 사용자 생성 (Supabase에 저장)
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            username,
            email,
            password: password // 실제 프로덕션에서는 해시된 비밀번호 사용
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('사용자 생성 오류:', insertError);
        throw new Error('회원가입 중 오류가 발생했습니다.');
      }

      // 로컬 스토리지에도 저장
      localStorage.setItem('user', JSON.stringify(newUser));
      setCurrentUser(newUser);
      
      console.log('회원가입 성공:', newUser);
      return newUser;
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      // Supabase에서 사용자 확인
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);
      
      if (error) {
        console.error('로그인 확인 오류:', error);
        throw new Error('로그인 확인 중 오류가 발생했습니다.');
      }

      if (!users || users.length === 0) {
        throw new Error('존재하지 않는 이메일입니다.');
      }

      const user = users[0];

      // 테스트 계정 확인 (비밀번호 검증 생략)
      if (email === 'test@test.com' && password === '123456') {
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        console.log('테스트 계정 로그인 성공:', user);
        return user;
      }

      // 일반 계정은 비밀번호 검증 없이 로그인 허용 (데모용)
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      console.log('로그인 성공:', user);
      return user;
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    console.log('로그아웃 완료');
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