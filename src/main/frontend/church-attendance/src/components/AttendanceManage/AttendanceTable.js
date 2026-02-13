import React, { useState } from 'react';
// 🔑 1. [수정] Bootstrap 컴포넌트 import
import { Accordion, Button, Form, InputGroup, Badge, Row, Col, Container, Card, ButtonGroup, useAccordionButton } from 'react-bootstrap';
// 🔑 2. [신규] TalentModal import
import TalentModal from './TalentModal'; 

function AttendanceTable({ selectedDate, onBack, initialMembers = [], isModificationMode, onSaveComplete, isYouthLeader, isReadOnly, onDelete }) { 
	const [currentMembers, setCurrentMembers] = useState(initialMembers);
// 🔑 3. [수정] Accordion의 '활성 키'로 확장 상태 관리 (하나만 열리도록)
	const [expandedStudentId, setExpandedStudentId] = useState(null);
const cleanDate = selectedDate.replace(/\s*\([^)]+\)/, '').trim(); 
	
    // 🔑 4. [수정] isReadOnly일 때 제목 변경 (이전 로직)
    const editModeTitle = isReadOnly 
        ? "내용"
        : isModificationMode ? "수정하기" : "등록하기";
    const finalTitle = `${cleanDate} 출결 ${editModeTitle}`;

	// -------------------- 핸들러 (수정 없음) --------------------
	const handleStatusChange = (memberId, newStatus) => {
		setCurrentMembers(prev => 
			prev.map(m => {
				if (m.id === memberId) {
					// 🔑 [수정] 달란트 점수를 0으로 강제하는 로직 (이전 요청)
					const newTalent = (newStatus === 'Present') ? 0 : 0; 
					return { ...m, attendance: newStatus, talent: newTalent };
				}
				return m;
			})
		);
// 🔑 '읽기 전용'이 아닐 때만 버튼 클릭 시 항목 확장
        if (!isReadOnly) {
            setExpandedStudentId(memberId);
        }
	};

	const handleInputChange = (memberId, field, value) => {
		setCurrentMembers(prev => 
			prev.map(m => 
				m.id === memberId ? { ...m, [field]: value } : m
			)
		);
	};
	
	const handleSave = () => {
		onSaveComplete(selectedDate, currentMembers); 
	};
    // ----------------------------------------------------

	return (
        // 🔑 5. [수정] .attendance-edit-view -> Container (패딩 추가)
		<Container className="py-3">
            {/* 6. 헤더 (Bootstrap 클래스 사용) */}
			{/* [이전 요청] 'border-bottom' 클래스 제거됨 */}
			<div className="pb-3 mb-3 text-center">
				<h3 className="h4 text-primary">{finalTitle}</h3>
			</div>
			
            {/* 7. 출결 목록 (Accordion으로 교체) */}
			<Accordion activeKey={expandedStudentId} onSelect={(key) => setExpandedStudentId(key)}>
				{currentMembers.map(member => (
                    // 🔑 8. [신규] TalentModal 상태 관리 (Accordion Item 내부에서)
                    <AttendanceAccordionItem
                        key={member.id}
                        student={member}
                        eventKey={member.id} // Accordion이 제어할 ID
                        // [이전 요청] 현재 활성화되었는지 여부를 prop으로 전달
                        isActive={member.id === expandedStudentId} 
                        isReadOnly={isReadOnly}
                        isYouthLeader={isYouthLeader}
                        onStatusChange={handleStatusChange}
                        onInputChange={handleInputChange}
                    />
				))}
			</Accordion>
			
            {/* 9. 하단 버튼 (Bootstrap 클래스 사용) */}
			<div className="d-flex justify-content-end gap-2 mt-3">
				<Button variant="outline-secondary" onClick={onBack}>돌아가기</Button>				
                {!isReadOnly && (
                    <div className="d-flex gap-2">
                        {isModificationMode && (
                            <Button 
                                variant="outline-danger"
                                onClick={() => onDelete(selectedDate)}
                            >
                                삭제하기
                            </Button>
                        )}
                        <Button variant="primary" onClick={handleSave}>
                            {isModificationMode ? "수정하기" : "저장하기"}
                        </Button>
                    </div>
                )}
			</div>
		</Container>
	);
}

// 🔑 10. [신규] Accordion Item 컴포넌트 (AttendanceListItem 대체)
function AttendanceAccordionItem({ student, eventKey, isReadOnly, isYouthLeader, onStatusChange, onInputChange, isActive }) {
    const { id, name, attendance, talent, reason, note } = student;
    const isAttendanceDetail = attendance === 'Present';
    const isAbsentDetail = attendance === 'Absent';
    const toggleHeader = CustomAccordionToggle({ eventKey });

    // 11. 달란트 모달 상태
    const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
    const handleTalentModalOpen = (e) => {
        e.stopPropagation(); 
        setIsTalentModalOpen(true);
    };
    const handleTalentSave = (calculatedAmount) => {
        onInputChange(id, 'talent', calculatedAmount);
        setIsTalentModalOpen(false);
    };

    // 🔑 [수정] 'CustomAccordionToggle' 함수 다시 사용
    function CustomAccordionToggle({ eventKey }) {
        const decoratedOnClick = useAccordionButton(eventKey);
    // 이제 클릭 핸들러만 반환하고, 이 핸들러를 외부 div에 적용합니다.
        return decoratedOnClick;
    }

    // 12. 읽기 전용 UI
    if (isReadOnly) {
        return (
            // [이전 요청] 'mb-2'가 제거된 상태 유지 (아이템들이 붙어있음)
            <Card border={isActive ? 'primary' : undefined}>
                <Card.Header className="d-flex justify-content-between align-items-center p-3">
                    <span className="fw-bold">{name}</span>
                    {attendance === 'Present' 
                        ? <Badge bg="success">출석</Badge>
                        : <Badge bg="danger">결석</Badge>
                    }
                </Card.Header>
             
                {(note || reason) && (
                    <Card.Body className="py-2 px-3">
                        {isAttendanceDetail && note && <p className="mb-0 small"><strong>비고:</strong> {note}</p>}
                        {isAbsentDetail && reason && <p className="mb-0 small"><strong>결석 사유:</strong> {reason}</p>}
                    </Card.Body>
                )}
            </Card>
        );
    }

    // 13. 수정 가능 UI
    return (
        <>
            {/* [이전 요청] 'mb-2'가 제거된 상태, 'border-primary' 활성화 로직 유지 */}
            <Accordion.Item eventKey={eventKey} className={`${isActive ? 'border border-primary' : ''}`}>
                
                {/* 🔑 [수정] 
                  'Accordion.Header' 대신 커스텀 'div'로 복귀
                  'd-flex justify-content-between align-items-center'로 정렬
                */}
                <div 
                    className="accordion-header-custom p-3 d-flex justify-content-between align-items-center"
                    onClick={toggleHeader} // 🔑 전체 div 클릭 시 토글
                    style={{ cursor: 'pointer' }} // 시각적 표시
                >
                    
                    {/* 1. 이름 (왼쪽) */}
                    <div className="fw-bold"> 
                        {name}
                    </div>

                    {/* 2. 버튼 그룹 (오른쪽) */}
                    <div>
                        {/* [요청 1] 'size="sm"' 제거 -> 버튼 커짐 */}
                        <ButtonGroup onClick={(e) => e.stopPropagation()}>
                            <Button 
                                variant={attendance === 'Present' ? 'success' : 'outline-success'}
                                onClick={() => onStatusChange(id, 'Present')}
                            >
                                출석
                            </Button>
                            <Button 
                                variant={attendance === 'Absent' ? 'danger' : 'outline-danger'}
                                onClick={() => onStatusChange(id, 'Absent')}
                            >
                                결석
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>
                
                {/* 13-2. 본문 (상세 입력) - 변경 없음 */}
                <Accordion.Body>
                    {isAttendanceDetail && (
                        <Form.Group as={Row} className="mb-2 align-items-center">
                            {isYouthLeader && (
                                <>
                                    <Form.Label column sm={2}>달란트</Form.Label>
                                    <Col sm={10}>
                                        <InputGroup>
                                            <InputGroup.Text>{talent || 0} 달란트</InputGroup.Text>
                                            <Button variant="outline-secondary" onClick={handleTalentModalOpen}>
                                                등록하기
                                            </Button>
                                        </InputGroup>
                                    </Col>
                                </>
                            )}
                            <Form.Label column sm={2} className="mt-2">보고 사항</Form.Label>
                            <Col sm={10} className="mt-2">
                                <Form.Control 
                                    type="text" 
                                    value={note || ''} 
                                    onChange={(e) => onInputChange(id, 'note', e.target.value)}
                                    placeholder="보고 사항을 입력하세요."
                                />
                            </Col>
                        </Form.Group>
                    )}
                    {isAbsentDetail && (
                        <Form.Group as={Row} className="mb-2 align-items-center">
                            <Form.Label column sm={2}>결석 사유</Form.Label>
                            <Col sm={10}>
                                <Form.Control 
                                    type="text" 
                                    value={reason || ''} 
                                    onChange={(e) => onInputChange(id, 'reason', e.target.value)}
                                    placeholder="결석 사유를 입력하세요."
                                />
                            </Col>
                        </Form.Group>
                    )}
                </Accordion.Body>
            </Accordion.Item>

            {/* 14. 달란트 모달 (이전 로직과 연결) */}
            <TalentModal
                isOpen={isTalentModalOpen}
                onClose={() => setIsTalentModalOpen(false)}
                onSave={handleTalentSave}
                studentName={name}
            />
        </>
    );
}

export default AttendanceTable;