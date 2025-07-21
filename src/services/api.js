import { supabase } from './supabase';

// 레스토랑 관련 API
export const restaurantAPI = {
  // 모든 레스토랑 조회
  getAll: async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*');
    
    if (error) throw error;
    return { data };
  },
  
  // ID로 레스토랑 조회
  getById: async (id) => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data };
  },
  
  // 새 레스토랑 추가
  create: async (restaurant) => {
    const { data, error } = await supabase
      .from('restaurants')
      .insert(restaurant)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  },
  
  // 레스토랑 정보 수정
  update: async (id, restaurant) => {
    const { data, error } = await supabase
      .from('restaurants')
      .update(restaurant)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  },
  
  // 레스토랑 삭제
  delete: async (id) => {
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },
  
  // 요리 타입으로 검색
  getByCuisine: async (cuisine) => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('cuisine', cuisine);
    
    if (error) throw error;
    return { data };
  },
  
  // 평점으로 검색
  getByRating: async (rating) => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .gte('rating', rating);
    
    if (error) throw error;
    return { data };
  },
  
  // 키워드로 검색
  search: async (keyword) => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    
    if (error) throw error;
    return { data };
  },
  
  // 근처 레스토랑 검색
  getNearby: async (lat, lng, radius = 0.01) => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);
    
    if (error) throw error;
    
    // 클라이언트에서 거리 계산
    const nearby = data.filter(restaurant => {
      const distance = Math.sqrt(
        Math.pow(restaurant.latitude - lat, 2) + 
        Math.pow(restaurant.longitude - lng, 2)
      );
      return distance <= radius;
    });
    
    return { data: nearby };
  },
  
  // 랜덤 레스토랑 추천
  getRandom: async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      return { data: data[randomIndex] };
    }
    
    return { data: null };
  },
};

export default restaurantAPI; 