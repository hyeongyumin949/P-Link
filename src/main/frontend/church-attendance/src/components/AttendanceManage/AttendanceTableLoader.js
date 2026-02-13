// src/components/AttendanceManage/AttendanceTableLoader.js (신규 파일)
import React, { useState, useEffect } from 'react';
// 1. URL 파라미터(:date)를 읽기 위해 useParams를 가져옵니다.
import { useParams, useNavigate } from 'react-router-dom';
import { useMemberContext } from '../../MemberContext';
import AttendanceTable from './AttendanceTable';
import apiClient from '../../api/apiClient';
import { toast } from 'react-toastify';

function AttendanceTableLoader() {
    // 2. URL에서 날짜 파라미터 추출 (예: '2025-11-04')
    const { date } = useParams(); 
    const navigate = useNavigate();

    // 3. AttendanceManage에 있던 상태들을 여기로 가져옴 [cite: 529-530]
    const [loadedRecords, setLoadedRecords] = useState([]);
    const [isModification, setIsModification] = useState(false);
    const [displayDate, setDisplayDate] = useState(''); // "2025년..."
    const [isLoading, setIsLoading] = useState(true);

    // 4. Context에서 필요한 함수들을 가져옴
    const { 
        user, 
        saveAttendanceRecords, 
        deleteAttendanceRecords 
    } = useMemberContext();
    const isYouthLeader = user ? user.isYouth : false; 

    // 5. [핵심] URL의 date가 변경될 때마다 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // 6. apiClient.get 호출 (기존 loadAttendanceData 로직) [cite: 541]
                const response = await apiClient.get(`/api/attendance?date=${date}`);
                setLoadedRecords(response.data.records);
                setIsModification(response.data.snapshotLoaded);
                
                // 7. 표시용 날짜 문자열 생성 (기존 로직 활용)
                const dateObj = new Date(date.split('-').join('/')); // YYYY-MM-DD -> Date 객체
                const weekday = dateObj.toLocaleDateString('ko-KR', { weekday: 'long' });
                setDisplayDate(`${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 (${weekday})`);

            } catch (error) {
                toast.error("출결 정보 로드에 실패했습니다.");
                setLoadedRecords([]);   
            }
            setIsLoading(false);
        };

        if (date) {
            loadData();
        }
    }, [date]); // date가 바뀔 때마다 실행

    // 8. 뒤로가기 핸들러 (캘린더로 이동)
    const handleBackToCalendar = () => {
        navigate('/attendance'); // 부모 라우트(index)로 이동
    };

    // 9. 저장/삭제 핸들러 (기존 AttendanceManage 로직) [cite: 535-540]
    const handleSaveComplete = async (dateStr, records) => {
        // [주의] dateStr은 "2025년..." 형식이므로 
        // saveAttendanceRecords 내부의 formatLocalDate [cite: 404]가 처리합니다.
        const isSuccess = await saveAttendanceRecords(dateStr, records);
        if (isSuccess) {
            handleBackToCalendar(); // 저장 성공 시 캘린더로
        }
    };

    const handleDeleteAttendance = async (dateStr) => {
        if (window.confirm("오늘 등록된 출결 기록을 모두 삭제하시겠습니까?")) {
            const isSuccess = await deleteAttendanceRecords(dateStr);
            if (isSuccess) {
                handleBackToCalendar(); // 삭제 성공 시 캘린더로
            }
        }
    };

    // 10. 로딩 중...
    if (isLoading) {
        return <div>출결 정보를 불러오는 중...</div>;
    }

    // 11. 로드가 끝나면 AttendanceTable을 렌더링
    const todayYMD = new Date().toISOString().split('T')[0];
    const isTodayRegistration = date === todayYMD;

    return (
        <AttendanceTable 
            selectedDate={displayDate} 
            onBack={handleBackToCalendar} 
            onSaveComplete={handleSaveComplete} 
            onDelete={handleDeleteAttendance}
            initialMembers={loadedRecords} 
            isYouthLeader={isYouthLeader} 
            isModificationMode={isModification}
            isReadOnly={!isTodayRegistration}
        />
    );
}

export default AttendanceTableLoader;