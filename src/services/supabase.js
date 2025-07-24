import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ddhrabdtbwzdmukbkixo.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkaHJhYmR0Ynd6ZG11a2JraXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjE4NTcsImV4cCI6MjA2ODYzNzg1N30.Z5QGluZn2yTPzkqNgklAKkegrPKaVrcAlu3eczMSISo';

// 실제 Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };

// Supabase를 통한 직접 데이터 접근 (백엔드 없이 사용 가능)
export const supabaseAPI = {
  // 모든 레스토랑 조회
  getAll: async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*');
    
    if (error) throw error;
    return data;
  },
  
  // ID로 레스토랑 조회
  getById: async (id) => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // 요리 타입으로 검색
  getByCuisine: async (cuisine) => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('cuisine', cuisine);
    
    if (error) throw error;
    return data;
  },
  
  // 평점으로 검색
  getByRating: async (rating) => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .gte('rating', rating);
    
    if (error) throw error;
    return data;
  },
  
  // 랜덤 레스토랑 추천
  getRandom: async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .limit(1)
      .order('id', { ascending: false });
    
    if (error) throw error;
    return data[0];
  }
}; 