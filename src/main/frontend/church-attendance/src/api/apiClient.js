// src/api/apiClient.js

import axios from 'axios';

// 1. Axios 인스턴스 생성
const apiClient = axios.create({
    // React 개발 서버의 proxy 설정이 Spring Boot의 8080 포트로 연결되어 있다고 가정
    // baseURL을 설정하지 않으면 상대 경로(/api/...)로 요청이 전송됨
    // baseURL: 'http://localhost:8080/', 
    headers: {
        'Content-Type': 'application/json',
    },
});


// 2. 요청 인터셉터 설정 (가장 중요)
// 모든 요청이 서버로 전송되기 전에 이 코드가 실행됩니다.
apiClient.interceptors.request.use(
    (config) => {
        // LocalStorage에서 저장된 JWT를 가져옵니다.
        const token = localStorage.getItem('jwt_token');

        // 토큰이 존재하면, Authorization 헤더에 Bearer 토큰을 추가합니다.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        // 요청 에러 처리
        return Promise.reject(error);
    }
);

// 3. 응답 인터셉터 (선택적)
// 응답을 받은 후, 토큰 만료 등 에러 처리를 할 수 있습니다. (향후 확장 가능)
apiClient.interceptors.response.use(
    (response) => {
        // 성공적인 응답은 그대로 반환
        return response;
    },
    (error) => {
        // 401 Unauthorized 에러가 발생하면 (토큰 만료), 로그아웃 처리 유도 가능
        // if (error.response && error.response.status === 401) {
        //     // ... 여기에 로그아웃 및 로그인 페이지 리다이렉션 로직 추가 가능
        // }
        return Promise.reject(error);
    }
);


export default apiClient;