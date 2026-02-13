import React, { useState } from 'react';
// 🔑 1. [수정] react-bootstrap 컴포넌트 import
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

// 1. 달란트 항목 정의 (수정 없음)
const TALENT_OPTIONS = [
    { id: 'present', label: '예배 출석', points: 2 },
    { id: 'bible', label: '성경책', points: 1 },
    { id: 'evangelism', label: '전도', points: 5 },
];

function TalentModal({ isOpen, onClose, onSave, studentName }) {
    const [checkedItems, setCheckedItems] = useState({});
    const [customPoints, setCustomPoints] = useState(0);

    // 2. 체크박스 핸들러 (수정 없음)
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setCheckedItems(prev => ({ ...prev, [name]: checked }));
    };

    // 3. 직접 입력 핸들러 (수정 없음)
    const handleCustomChange = (e) => {
        setCustomPoints(Number(e.target.value) || 0);
    };

    // 4. 점수 계산 및 저장 핸들러 (수정 없음)
    const handleSave = () => {
        let total = 0;
        TALENT_OPTIONS.forEach(option => {
            if (checkedItems[option.id]) {
                total += option.points;
            }
        });
        total += customPoints;
        
        onSave(total); // 부모(AttendanceListItem)로 총점 전달
        
        // 상태 초기화 및 모달 닫기
        setCheckedItems({});
        setCustomPoints(0);
        onClose();
    };

    // 🔑 5. [수정] return 문 전체를 <Modal> 컴포넌트로 교체
    return (
        <Modal show={isOpen} onHide={onClose} centered>
            {/* 5-1. 헤더 */}
            <Modal.Header closeButton>
                <Modal.Title as="h5">{studentName} - 달란트 등록</Modal.Title>
            </Modal.Header>
            
            {/* 5-2. 본문 (Form) */}
            <Modal.Body>
                <Form>
                    {/* 5-3. 체크박스 목록 */}
                    {TALENT_OPTIONS.map(option => (
                        <Form.Check 
                            type="checkbox"
                            key={option.id}
                            id={`talent-check-${option.id}`}
                            name={option.id}
                            label={`${option.label} (+${option.points}달란트)`}
                            checked={!!checkedItems[option.id]}
                            onChange={handleCheckboxChange}
                            className="mb-2 fs-5" // Bootstrap 클래스로 스타일링
                        />
                    ))}
                    
                    <hr />
                    
                    {/* 5-4. 직접 입력 칸 */}
                    <Form.Group as={Row} className="align-items-center">
                        <Form.Label column sm={4} className="fw-bold">
                            기타 달란트:
                        </Form.Label>
                        <Col sm={8}>
                            <Form.Control
                                type="number"
                                id="custom"
                                name="custom"
                                value={customPoints === 0 ? '' : customPoints}
                                onChange={handleCustomChange}
                                placeholder="직접 입력"
                            />
                        </Col>
                    </Form.Group>
                </Form>
            </Modal.Body>

            {/* 5-5. 푸터 (버튼) */}
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onClose}>
                    취소
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    확인
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default TalentModal;