import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 1. 하위 페이지 컴포넌트들을 import
import ReservationNew from './ReservationNew';
import ReservationMyBooking from './ReservationMyBooking';

function ReservationManage() {
  return (
    // 2. 이 컴포넌트 자체도 중첩 라우트를 가집니다.
    <Routes>
        {/* 경로 1: /reservation (index)
            - 신규 예약 (3-Panel UI) 페이지
            - 이 컴포넌트가 '예약 플래그' 확인 후 리다이렉트 처리
        */}
        <Route index element={<ReservationNew />} />
        
        {/* 경로 2: /reservation/my-booking
            - 내 예약 확인/취소 페이지
        */}
        <Route path="my-booking" element={<ReservationMyBooking />} />
    </Routes>
  );
}

export default ReservationManage;