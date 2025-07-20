const API_BASE_URL = 'http://localhost:8081/api';

export const coordinateService = {
  // 모든 식당의 좌표 업데이트
  updateAllCoordinates: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/coordinates/update-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('좌표 업데이트에 실패했습니다.');
      }
      
      return await response.text();
    } catch (error) {
      console.error('좌표 업데이트 오류:', error);
      throw error;
    }
  },

  // 특정 식당의 좌표 업데이트
  updateSingleRestaurantCoordinates: async (restaurantId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/coordinates/update/${restaurantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('좌표 업데이트에 실패했습니다.');
      }
      
      return await response.text();
    } catch (error) {
      console.error('좌표 업데이트 오류:', error);
      throw error;
    }
  }
}; 