import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from './api/apiClient';
import { toast } from 'react-toastify';

// 1. Context 객체 생성
const MemberContext = createContext();



// -------------------- Provider 컴포넌트 정의 --------------------
export const MemberProvider = ({ children }) => {
    const [members, setMembers] = useState([]);
    const [attendanceDates, setAttendanceDates] = useState([]);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    
    // [ACTION 1] 출결 기록 저장 (API 연동)
    // 🔑 1. async (비동기) 함수로 변경
    const saveAttendanceRecords = async (date, records) => {
        
        // 🔑 2. 날짜 형식을 "YYYY-MM-DD"로 변환
        const formattedDate = formatLocalDate(date);
        if (!formattedDate) {
            toast.error("날짜 형식이 올바르지 않습니다.");
            return false; // 저장 실패
        }

        // 🔑 3. records(프론트)를 DTO(백엔드) 형식으로 매핑
        const recordDtos = records.map(r => ({
            memberId: r.id,          // 👈 'id' -> 'memberId'
            status: r.attendance,    // 👈 'attendance' -> 'status'
            reason: r.reason || '',  // 👈 null 방지
            note: r.note || '',      // 👈 비고 (보고 사항)
            talent: r.talent || 0    // 👈 'talent' (누적할 점수)
        }));

        // 🔑 4. 백엔드에 보낼 최종 DTO
        const requestDto = {
            date: formattedDate,
            records: recordDtos
        };

        // 5. API 호출
        try {
            await apiClient.post('/api/attendance', requestDto);
            toast.success("출결이 저장되었습니다.");
            
            // 🔑 [수정] 두 API 호출이 '완료'될 때까지 기다립니다.
            await fetchMembers(); 
            await fetchAttendanceDates(); 

            return true; // 👈 이제 Context가 100% 갱신된 후 true를 반환
        } catch (error) {
            console.error("출결 저장 실패:", error.response || error);
            toast.error("출결 저장에 실패했습니다.");
            return false;
        }
    };

    const fetchAttendanceDates = async () => {
        try {
            const response = await apiClient.get('/api/attendance/dates');
            
            setAttendanceDates(response.data); 
        } catch (error) {
            console.error("출결 날짜 목록 로드 실패:", error);
        }
    };

    const formatLocalDate = (dateStr) => {
    const cleanDate = dateStr.replace(/\s*\([^)]+\)/, '').trim();
    
    // "YYYY", "MM", "DD" 추출
    const parts = cleanDate.match(/(\d+)년 (\d+)월 (\d+)일/);
    if (!parts) return null; // 매칭 실패
    
    const year = parts[1];
    const month = parts[2].padStart(2, '0'); // "10" -> "10", "5" -> "05"
    const day = parts[3].padStart(2, '0');
    
    return `${year}-${month}-${day}`;
    };
    // [ACTION 2] 회원 추가/수정/삭제 (Soft Delete) - (유지)
    const addMember = async (newMemberData) => {
        // 1. 백엔드 DTO 형식에 맞는 데이터만 추출
        const requestDto = {
            name: newMemberData.name,
            contact: newMemberData.contact
        };
        
        try {
            // 2. POST /api/members 호출
            const response = await apiClient.post('/api/members', requestDto);
            
            // 3. API 성공 시, 백엔드가 반환한 (ID가 포함된) 새 회원 정보를 state에 추가
            setMembers(prev => [...prev, response.data]);
            
        } catch (error) {
            console.error("회원 추가 실패:", error.response || error);
            toast.error("회원 추가에 실패했습니다.");
        }
    };

    const updateMember = async (updatedMemberData) => {
        // 1. [레슨 적용] role 필드를 제거했으므로 DTO는 name과 contact만 보냅니다.
        const requestDto = {
            name: updatedMemberData.name,
            contact: updatedMemberData.contact,
            talent: updatedMemberData.talent
        };
        
        try {
            // 2. PUT /api/members/{id} API 호출
            const response = await apiClient.put(`/api/members/${updatedMemberData.id}`, requestDto);
            
            // 3. [레슨 적용] API가 반환한 최신 DTO(active, groupName 등이 포함된)로
            //    프론트엔드 상태(members)를 업데이트합니다.
            setMembers(prev => prev.map(m => 
                m.id === response.data.id ? response.data : m
            ));
            
            toast.success("수정되었습니다.");

        } catch (error) {
            console.error("회원 수정 실패:", error.response || error);
            toast.error("회원 수정에 실패했습니다.");
        }
    };

    // 🔑 [수정] async (비동기) 함수로 변경
    const deleteMember = async (memberId) => {
        try {
            // 1. DELETE /api/members/{id} API 호출
            //    (백엔드 Service가 알아서 isActive = false로 처리)
            await apiClient.delete(`/api/members/${memberId}`);
            
            // 2. [레슨 적용] API 호출이 성공하면, 프론트엔드 상태도 즉시 변경합니다.
            //    m.active 필터를 통과하도록 'active'를 false로 설정합니다.
            setMembers(prev => prev.map(m => 
                m.id === memberId ? { ...m, active: false } : m
            ));
            
        } catch (error) {
            console.error("회원 삭제 실패:", error.response || error);
            toast.error("회원 삭제(비활성화)에 실패했습니다.");
        }
    };


    const loginUser = (userData) => {
        let processedUser = userData;

        // 🔑 [추가]
        // 만약 'isYouth'는 없고 'youth'만 있다면 (새로고침 경로),
        // 'youth' 값을 'isYouth'로 복사하여 객체 구조를 통일시킵니다.
        if (userData.youth !== undefined && userData.isYouth === undefined) {
            processedUser = {
                id: userData.id,
                name: userData.name,
                role: userData.role,
                groupName: userData.groupName,
                isYouth: userData.youth // 👈 'youth'를 'isYouth'로 매핑
            };
        }
        
        // 🔑 LoginPage에서 왔든(isYouth), 새로고침(youth)해서 왔든
        // 항상 'isYouth' 키를 가진 객체를 state에 저장합니다.
        setUser(processedUser);
        fetchMembers(); 
        fetchAttendanceDates();
    };

    const logoutUser = () => {
        localStorage.removeItem('jwt_token');
        setUser(null);
        setMembers([]);
        setAttendanceDates([]);
    };

    const deleteAttendanceRecords = async (dateStr) => {
        // 1. 날짜를 "YYYY-MM-DD"로 변환
        const formattedDate = formatLocalDate(dateStr);
        if (!formattedDate) {
            toast.error("날짜 형식이 올바르지 않습니다.");
            return false;
        }

        try {
            // 2. DELETE /api/attendance?date=... API 호출
            await apiClient.delete(`/api/attendance?date=${formattedDate}`);
            toast.success("출결 기록이 삭제되었습니다.");

            // 3. 캘린더 점(dot)과 멤버(달란트) 상태 새로고침
            await fetchAttendanceDates();
            await fetchMembers();
            return true;

        } catch (error) {
            console.error("출결 삭제 실패:", error);
            toast.error(error.response?.data || "기록 삭제에 실패했습니다.");
            return false;
        }
    };

    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = localStorage.getItem('jwt_token');

            if (token) {
                try {
                    // 1. (기존) /api/auth/me 호출로 사용자 정보 로드
                    const response = await apiClient.get('/api/auth/me'); 
                    if (response.data) {
                        loginUser(response.data);
                    }
                } catch (error) {
                    console.error("토큰 검증 실패 또는 만료:", error.response || error.message);
                    logoutUser(); 
                }
            }
            setIsLoading(false);
        };

        checkLoginStatus();
    }, []); // 

    // 🔑 [신규 함수] 회원 목록을 불러오는 함수
    const fetchMembers = async () => {
        try {
            // GET /api/members 호출 (백엔드가 토큰에서 group_id를 알아서 처리)
            const response = await apiClient.get('/api/members');
            setMembers(response.data); 
        } catch (error) {
            console.error("회원 목록 로드 실패:", error);
        }
    };

    const currentUserId = user ? user.id : null;
    const currentUserName = user ? user.name : "방문자";

    const contextValue = {
        members, 
        attendanceDates,
        saveAttendanceRecords,
        addMember, 
        updateMember, 
        deleteMember, 
        currentUserId,    // 👈 추가
        currentUserName,
        user, 
        loginUser, 
        logoutUser, 
        isLoading,
        deleteAttendanceRecords,
    };

    if (isLoading) {
        return <div>로딩 중...</div>; // 실제 프로젝트에서는 스피너 등 로딩 컴포넌트 사용
    }
    
    return (
        <MemberContext.Provider value={contextValue}>
            {children}
        </MemberContext.Provider>
    );
};

// Custom Hook 정의
export const useMemberContext = () => {
    return useContext(MemberContext);
};