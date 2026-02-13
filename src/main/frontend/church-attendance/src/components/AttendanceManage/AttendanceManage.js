// AttendanceManage.js
import React from 'react';
// 1. react-router-dom에서 필요한 훅들을 가져옵니다.
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useMemberContext } from '../../MemberContext';
import AttendanceCalendar from './AttendanceCalendar';
// 2. [중요] 테이블 로직을 별도 컴포넌트로 분리합니다. (다음 단계에서 생성)
import AttendanceTableLoader from './AttendanceTableLoader'; 

function AttendanceManage() {
  const { attendanceDates } = useMemberContext();
  const navigate = useNavigate(); // 3. 페이지 이동을 위한 navigate 훅

  // [제거] const [view, setView] = useState('calendar'); 
  // [제거] const [selectedDate, ...] 등 테이블 관련 상태 [cite: 529]
  // [제거] renderView() 함수 [cite: 553]
  // [제거] loadAttendanceData() 함수 [cite: 540]

  // 4. 날짜 형식 헬퍼 (YMD) [cite: 544-545]
  const formatYMD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 5. [수정] 캘린더 클릭 핸들러
  const handleViewChangeToEdit = (dayOrDate) => {
    let apiDateStr;
    if (dayOrDate === 'today') {
        apiDateStr = formatYMD(new Date()); 
    } else {
        apiDateStr = formatYMD(dayOrDate); 
    }
    // 6. setView 대신 navigate로 URL을 변경합니다.
    navigate(apiDateStr); // 예: '2025-11-04' (상대 경로)
  };

  const formattedToday_YMD = formatYMD(new Date());
  const isTodaySaved = attendanceDates.includes(formattedToday_YMD);
  
  return (
    // 7. view 상태 대신 Routes로 뷰를 결정합니다.
    <Routes>
        {/* 경로 1: /attendance (기본, index) */}
        <Route 
            index 
            element={
                <AttendanceCalendar 
                    onViewChangeToEdit={handleViewChangeToEdit}
                    attendanceDates={attendanceDates}
                    isTodaySaved={isTodaySaved}
                />
            } 
        />
        
        {/* 경로 2: /attendance/:date (날짜 파라미터) */}
        <Route 
            path=":date" 
            element={
                <AttendanceTableLoader 
                    /* AttendanceTableLoader가 
                      URL의 :date를 읽어서 데이터를 로드하고
                      AttendanceTable을 렌더링합니다.
                    */
                />
            } 
        />
    </Routes>
  );
}

export default AttendanceManage;