import React, { useState } from 'react';
// 🔑 1. [수정] react-bootstrap의 Container, Button import
import { Container, Button, Row, Col } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css'; // 🔑 (이 파일은 react-calendar 디자인용으로 유지)

const formatYMD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

function AttendanceCalendar({ onViewChangeToEdit, attendanceDates, isTodaySaved}) { 
	const today = new Date();
	const todayDateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
	const [activeMonth, setActiveMonth] = useState(today);
	
	// 🔑 3. [수정] buttonClass 대신 Bootstrap의 'variant'를 사용
	const buttonVariant = isTodaySaved ? 'outline-success' : 'primary';
	const buttonText = isTodaySaved 
		? `금일 출결 등록 완료 (${todayDateStr})`
		: `금일 출결 등록하기 (${todayDateStr})`;

	const savedDatesSet = new Set(attendanceDates);

	const getTileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateYMD = formatYMD(date);
            if (savedDatesSet.has(dateYMD)) {
                // 🔑 4. [수정] styles[...] -> "data-saved" (Calendar.css가 인식)
                return "data-saved"; 
            }
        }
        return null;
    };
    
	const handleDayClick = (date) => {
        const dateYMD = formatYMD(date);
        if (savedDatesSet.has(dateYMD)) {
            onViewChangeToEdit(date);
        }
    };

	return (
        // 🔑 5. [수정] div -> <Container> 및 Bootstrap 클래스로 교체
		<Container className="py-2"> 
			<Row className="justify-content-center"> {/* 1. Row로 감싸고 중앙 정렬 */}
				<Col xs={12} md={10} lg={8} xl={6}> {/* 2. 화면 크기별 너비 지정 */}

					{/* 1. 금일 출결 버튼 영역 */}
					<div className="d-grid gap-2"> {/* 3. d-grid로 버튼 크기 확보 */}
						<Button 
							variant={buttonVariant} 
							size="lg" // 4. 버튼 크기를 키워 강조
							className="py-3 border-3"
							onClick={() => onViewChangeToEdit('today')}
							disabled={isTodaySaved}
						>
							{buttonText}
						</Button>
					</div>
					
					{/* 2. 구분선 */}
					<hr className="my-4" /> {/* Col 안에서는 너비 100%가 자연스러움 */}

					{/* 3. 출결 수정하기 텍스트 영역 */}
					<div className="text-center mb-3">
						{/* 5. text-secondary로 변경 (text-muted보다 조금 더 부드러움) */}
						<h5 className="text-secondary fw-bold"> 
							출결 수정하기
						</h5>
					</div>

					{/* 4. 캘린더 영역 */}
					{/* 6. 캘린더에 그림자와 패딩, 테두리 추가 */}
					<div className="calendar-container-inner bg-light rounded p-3"> 
						<Calendar
							locale="ko-KR"
							tileClassName={getTileClassName}
							onClickDay={handleDayClick}
							activeStartDate={activeMonth}
							onActiveStartDateChange={({ activeStartDate }) => setActiveMonth(activeStartDate)}
						/>
					</div>
				</Col>
			</Row>
		</Container>
	);
}

export default AttendanceCalendar;