import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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