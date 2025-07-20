import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 레스토랑 관련 API
export const restaurantAPI = {
  // 모든 레스토랑 조회
  getAll: () => api.get('/restaurants'),
  
  // ID로 레스토랑 조회
  getById: (id) => api.get(`/restaurants/${id}`),
  
  // 새 레스토랑 추가
  create: (restaurant) => api.post('/restaurants', restaurant),
  
  // 레스토랑 정보 수정
  update: (id, restaurant) => api.put(`/restaurants/${id}`, restaurant),
  
  // 레스토랑 삭제
  delete: (id) => api.delete(`/restaurants/${id}`),
  
  // 요리 타입으로 검색
  getByCuisine: (cuisine) => api.get(`/restaurants/cuisine/${cuisine}`),
  
  // 평점으로 검색
  getByRating: (rating) => api.get(`/restaurants/rating/${rating}`),
  
  // 키워드로 검색
  search: (keyword) => api.get(`/restaurants/search?keyword=${keyword}`),
  
  // 근처 레스토랑 검색
  getNearby: (lat, lng, radius = 0.01) => 
    api.get(`/restaurants/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
  
  // 랜덤 레스토랑 추천
  getRandom: () => api.get('/restaurants/random'),
};

export default api; 