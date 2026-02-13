import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Spinner, Button } from 'react-bootstrap';
import Calendar from 'react-calendar'; // 👈 [1. 재활용] 'react-calendar' 직접 임포트
import 'react-calendar/dist/Calendar.css';
import '../AttendanceManage/Calendar.css'; // 👈 [2. 재활용] 캘린더 CSS
import apiClient from '../../api/apiClient';
import AttendanceTable from '../AttendanceManage/AttendanceTable'; // 👈 [4. 재활용] 출결 상세 테이블
import { toast } from 'react-toastify';

// 헬퍼 함수 (from AttendanceCalendar.js [cite: 118-119])
const formatYMD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


// 헬퍼 함수 (from AttendanceManage.js [cite: 147-148])
const formatDisplayDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = date.toLocaleDateString('ko-KR', { weekday: 'long' });
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
};


function ParishAttendanceManage({user}) {
    // --- 1. State 정의 ---
    const [view, setView] = useState('calendar'); // 'calendar' | 'detail'
    
    // 캘린더용
    const [activeMonth, setActiveMonth] = useState(new Date());
    const [parishDates, setParishDates] = useState(new Set()); // 👈 '점' 찍을 날짜 Set
    const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);

    // 요약 리스트용
    const [selectedDate, setSelectedDate] = useState(null); // 👈 Date 객체
    const [summaryData, setSummaryData] = useState([]); // 👈 속별 요약 데이터
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    // 상세 보기용
    const [detailData, setDetailData] = useState(null); // 👈 { group, records }

    
    // --- 2. API 호출 ---

    // (A) [마운트 시] 캘린더 '점' 데이터 로드
    // (API 1: GET /api/parish/attendance/dates)
    const fetchParishDates = async () => {
        setIsLoadingCalendar(true);
        try {
            const response = await apiClient.get('/api/parish/attendance/dates');
            setParishDates(new Set(response.data)); // 👈 ["2025-11-01", "2025-11-02"]
        } catch (error) {
            toast.error("교구 출결 날짜를 불러오는 데 실패했습니다.");
        }
        setIsLoadingCalendar(false);
    };

    // (B) [날짜 클릭 시] '속별 요약' 데이터 로드
    // (API 2: GET /api/parish/attendance/summary?date=...)
    const fetchSummary = async (date) => {
        setSelectedDate(date);
        setIsLoadingSummary(true);
        setSummaryData([]);
        setView('calendar');
        
        const apiDateStr = formatYMD(date);
        try {
            const response = await apiClient.get(`/api/parish/attendance/summary?date=${apiDateStr}`);
            
            // 💡 [수정] response.data를 'groupName' 기준으로 정렬
            const sortedData = response.data.sort((a, b) => 
                a.groupName.localeCompare(b.groupName) // '가나다' 순 정렬
            );
            
            setSummaryData(sortedData); // 👈 정렬된 데이터를 저장
            
        } catch (error) {
            toast.error("출결 요약 정보를 불러오는 데 실패했습니다.");
        }
        setIsLoadingSummary(false);
    };

    // (C) [속 클릭 시] '속 상세 출결' 데이터 로드 (읽기 전용)
    // (기존 API 활용: GET /api/attendance?date=...)
    const fetchGroupDetail = async (groupSummary) => {
        setIsLoadingSummary(true); // (요약 리스트 영역에 로딩 표시)
        
        const apiDateStr = formatYMD(selectedDate);
        
        try {
            // ❌ [수정 전] 잘못된 속장용 API
            // const response = await apiClient.get(`/api/attendance?date=${apiDateStr}&groupId=${groupSummary.groupId}`);
            
            // ⭕️ [수정 후] '교구장용'으로 새로 만든 API 호출
            // 이 API는 'ParishController'가 받아서 'groupId'를 존중합니다.
            const response = await apiClient.get(`/api/parish/attendance?date=${apiDateStr}&groupId=${groupSummary.groupId}`);
            
            setDetailData({
                group: groupSummary,
                records: response.data.records, // 👈 7속의 멤버 목록
                isSnapshotLoaded: response.data.snapshotLoaded
            });
            setView('detail'); // 👈 상세 뷰로 전환
            
        } catch (error) {
            toast.error("속 상세 정보를 불러오는 데 실패했습니다.");
        }
        setIsLoadingSummary(false);
    };
    useEffect(() => {
        fetchParishDates(); // 1회 실행
    }, []);

    
    // --- 3. 핸들러 및 헬퍼 ---

    // 캘린더 '점' 표시 헬퍼 (from AttendanceCalendar.js )
    const getTileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateYMD = formatYMD(date);
            if (parishDates.has(dateYMD)) {
                return "data-saved"; // 👈 'Calendar.css'가 인식하는 클래스 [cite: 233]
            }
        }
        return null;
    };

    // 상세 뷰에서 '뒤로가기'
    const handleBackToCalendar = () => {
        setView('calendar');
        setDetailData(null);
    };

    const parishSummary = useMemo(() => {
        // '제출'된 속의 데이터만 필터링합니다.
        const submittedGroups = summaryData.filter(g => g.submitted);

        // 1. 총 출석 인원 (요청하신 값)
        const totalPresent = submittedGroups.reduce((acc, group) => acc + group.presentCount, 0);

        // 2. '제출된 속'의 총원 (presentCount + absentCount)
        const totalMembersInList = submittedGroups.reduce((acc, group) => acc + (group.presentCount + group.absentCount), 0);

        return {
            totalPresent,          // 총 출석
            totalMembersInList,    // 총원 (제출 속 기준)
            totalGroups: summaryData.length, // 전체 속 개수
            submittedGroupCount: submittedGroups.length // 제출한 속 개수
        };
    }, [summaryData]);


    // --- 4. 렌더링 ---

    // [뷰 2: 상세 보기]
    // 💡 'AttendanceTable' 컴포넌트를 '읽기 전용'으로 재활용 
    if (view === 'detail') {
        const displayDate = formatDisplayDate(selectedDate);
        
        // 💡 [1. 신규] 상세 페이지용 출결 현황 계산
        const totalMembers = detailData.records.length;
        const detailPresent = detailData.records.filter(m => m.attendance === 'Present').length;
        const detailAbsent = totalMembers - detailPresent;

        return (
            <Container className="py-3">
                
                {/* 1. 헤더 (뒤로가기 버튼) */}
                <div className="pb-3 mb-3 border-bottom d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="h4 text-primary mb-0">{detailData.group.groupName}</h3>
                        <span className="text-muted">{displayDate} - 출결 상세</span>
                    </div>
                    <Button variant="outline-secondary" onClick={handleBackToCalendar}>
                        ← 요약으로 돌아가기
                    </Button>
                </div>

                {/* 💡 [2. 신규] 상세 현황 헤더 (요청 사항) */}
                <Card className="bg-light mb-3">
                    <Card.Body className="p-3">
                        <Row className="text-center">
                            <Col>
                                <div className="text-muted small">총원</div>
                                <div className="fs-5 fw-bold">{totalMembers}명</div>
                            </Col>
                            <Col>
                                <div className="text-muted small">출석</div>
                                <div className="fs-5 fw-bold text-success">{detailPresent}명</div>
                            </Col>
                            <Col>
                                <div className="text-muted small">결석</div>
                                <div className="fs-5 fw-bold text-danger">{detailAbsent}명</div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* 💡 [3. 수정] 3단 그리드 리스트 */}
                
                {/* 3-1. 리스트 헤더 (제목) */}
                {/* 💡 [수정] className에 'px-2'를 추가하여
                     아래 본문 리스트의 패딩과 동일하게 맞춥니다.
                */}
                <Row className="fw-bold text-muted border-bottom pb-2 mb-2 px-2 small">
                    {/* 너비 2 (16.7%) */}
                    <Col xs={2} className="text-start">이름</Col>
                    {/* 너비 2 (16.7%) */}
                    <Col xs={2} className="text-center">출결 상태</Col>
                    {/* 너비 8 (66.6%) */}
                    <Col xs={8} className="text-start">사유 / 보고 사항</Col>
                </Row>

                {/* 3-2. 리스트 본문 (수정 없음) */}
                <ListGroup variant="flush">
                    {!totalMembers ? (
                        <ListGroup.Item className="text-muted text-center p-3">
                            해당 날짜의 출결 대상 멤버가 없습니다.
                        </ListGroup.Item>
                    ) : (
                        detailData.records.map(member => (
                            <ListGroup.Item key={member.id} className="py-3 px-2">
                                <Row className="align-items-center"> 
                                    
                                    {/* Column 1: 이름 (너비 2) */}
                                    <Col xs={2} className="fw-bold fs-6 text-start">
                                        {member.name}
                                    </Col>
                                    
                                    {/* Column 2: 출결 상태 (너비 2) */}
                                    <Col xs={2} className="text-center">
                                        {member.attendance === 'Present' ? (
                                            <Badge bg="success">출석</Badge>
                                        ) : (
                                            <Badge bg="danger">결석</Badge>
                                        )}
                                    </Col>

                                    {/* Column 3: 사유 / 보고 사항 (너비 8) */}
                                    <Col xs={8} className="text-muted small text-start">
                                        {member.attendance === 'Present' 
                                            ? (member.note || '-') // 보고 사항
                                            : (member.reason || '-') // 결석 사유
                                        }
                                    </Col>

                                </Row>
                            </ListGroup.Item>
                        ))
                    )}
                </ListGroup>
            </Container>
        );
    }

    // [뷰 1: 캘린더 + 요약]
    return (
        <Container className="py-3">
            <div className="pb-3 mb-3 text-center border-bottom">
                <h3 className="h4 text-primary">교구 출결 현황</h3>
            </div>

            <Row>
                {/* 1. 캘린더 영역 */}
                <Col md={6} className="mb-3">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <div className="calendar-container-inner bg-light rounded p-3">
                                {isLoadingCalendar ? (
                                    <div className="text-center"><Spinner animation="border" size="sm" /></div>
                                ) : (
                                    <Calendar
                                        locale="ko-KR"
                                        tileClassName={getTileClassName}
                                        onClickDay={fetchSummary} // 👈 날짜 클릭 시 fetchSummary 호출
                                        activeStartDate={activeMonth}
                                        onActiveStartDateChange={({ activeStartDate }) => setActiveMonth(activeStartDate)}
                                    />
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* 2. 요약 영역 */}
                <Col md={6}>
                    <Card className="shadow-sm">
                        
                        {/* [3. 수정] 카드 헤더 1 - 날짜 표시 */}
                        <Card.Header as="h5" className="py-3">
                            {selectedDate 
                                ? formatDisplayDate(selectedDate)
                                : "날짜를 선택하세요"
                            }
                        </Card.Header>

                        {/* 💡 [4. 신규] 카드 헤더 2 - 교구 전체 요약 정보 표시 */}
                        {/* 데이터가 로드되었고, 요약할 내용이 있을 때만 표시 */}
                        {!isLoadingSummary && summaryData.length > 0 && (
                            <Card.Header className="bg-light p-3 border-top">
                                <Row className="text-center">
                                    <Col>
                                        <div className="text-muted small">제출한 속</div>
                                        <div className="fs-5 fw-bold">
                                            {parishSummary.submittedGroupCount} / {parishSummary.totalGroups}
                                        </div>
                                    </Col>
                                    <Col>
                                        {/* 요청하신 '현재 출석 인원' */}
                                        <div className="text-muted small">총 출석 인원</div>
                                        <div className="fs-5 fw-bold text-success">
                                            {parishSummary.totalPresent}명
                                        </div>
                                    </Col>
                                    <Col>
                                        <div className="text-muted small">총 등록 인원</div>
                                        <div className="fs-5 fw-bold">
                                            {parishSummary.totalMembersInList}명
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Header>
                        )}  
                        <Card.Body style={{ minHeight: '300px' }}>
                            {isLoadingSummary && (
                                <div className="text-center py-5">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </div>
                            )}
                            
                            {!isLoadingSummary && !selectedDate && (
                                <p className="text-muted text-center py-5">
                                    캘린더에서 날짜를 선택하면<br/>속별 출결 요약 정보가 표시됩니다.
                                </p>
                            )}

                            {!isLoadingSummary && selectedDate && summaryData.length === 0 && (
                                <p className="text-muted text-center py-5">
                                    해당 날짜에 등록된 출결 정보가 없습니다.
                                </p>
                            )}
                            
                            {!isLoadingSummary && summaryData.length > 0 && (
                            // [수정 1] 💡 variant="flush"를 "unstyled"로 변경하여
                            //          기본 테두리/배경을 제거합니다.
                            <ListGroup variant="unstyled">
                                {summaryData.map(group => (
                                    <ListGroup.Item 
                                        key={group.groupId}
                                        action
                                        onClick={() => group.submitted && fetchGroupDetail(group)}
                                        disabled={!group.submitted}
                                        
                                        // [수정 2] 💡 클릭 가능한 카드처럼 보이도록
                                        // 'NoticeList.js' 의 스타일을 적용합니다.
                                        // (그림자, 둥근 모서리, 테두리, 여백)
                                        className="p-3 mb-2 shadow-sm border rounded"
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="fw-bold fs-5">{group.groupName}</span>
                                                <small className="text-muted ms-2">(속장: {group.leaderName})</small>
                                            </div>
                                            <Badge bg={group.submitted ? 'success' : 'danger'} pill>
                                                {group.submitted ? '제출' : '미제출'}
                                            </Badge>
                                        </div>

                                        {/* (하이라이트 수정된 부분) */}
                                        {group.submitted && (
                                            <div className="mt-2 text-secondary small">
                                                <span className="fw-bold text-success me-2">
                                                    출석: {group.presentCount}명
                                                </span> |
                                                <span className="fw-bold text-danger ms-2 me-2">
                                                    결석: {group.absentCount}명
                                                </span> |
                                                {user && user.isYouth && (
                                                    <span className="ms-2">
                                                        | 획득 달란트: {group.totalTalentToday}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </Container>
    );
}

export default ParishAttendanceManage;