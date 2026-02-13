import React, { useState, useMemo } from 'react';
import { Modal, Button, ListGroup, Form } from 'react-bootstrap';
import { useMemberContext } from '../../MemberContext'; 
import { toast } from 'react-toastify';

function MemberDeleteModal({ isOpen, onClose, currentGroupName }) {
    
    const { members, deleteMember } = useMemberContext(); 
    const [selectedIds, setSelectedIds] = useState([]);
    
    const deletableMembers = useMemo(() => {
        return members.filter(m => 
            m.active && 
            m.groupName?.trim() === currentGroupName?.trim()
        );
    }, [members, currentGroupName]);

    const selectedCount = selectedIds.length;
    const isConfirmDisabled = selectedCount === 0;

    if (!isOpen) return null; 

    const handleToggleSelect = (memberId) => {
        setSelectedIds(prev => {
            if (prev.includes(memberId)) {
                return prev.filter(id => id !== memberId);
            } else {
                return [...prev, memberId];
            }
        });
    };

    const handleFinalDelete = () => {
        if (selectedIds.length === 0) return;

        const confirmed = window.confirm(`선택된 ${selectedIds.length}명의 회원을 정말로 삭제 하시겠습니까?`);
        
        if (confirmed) {
            selectedIds.forEach(id => deleteMember(id)); 
            
            toast(`${selectedIds.length}명의 회원이 목록에서 삭제되었습니다.`);
            setSelectedIds([]); 
            onClose();
        }
    };


    return (
    // 🔑 div.modal-overlay -> <Modal>
    <Modal show={isOpen} onHide={onClose} centered>

        {/* 1. 헤더 */}
        <Modal.Header closeButton>
            <Modal.Title as="h5">회원 삭제</Modal.Title>
        </Modal.Header>

        {/* 2. 본문 (회원 목록) */}
        <Modal.Body>
            {/* [수정 3] "small" 클래스를 제거하고 "mb-2"를 추가했습니다.
              <p> 태그의 기본 여백(margin)이 커서 혼자 튀어 보였던 것입니다.
            */}
            <p className="text-muted mb-2">비활성화(삭제)할 회원을 선택하세요.</p>

     
            <ListGroup variant="flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {deletableMembers.map(member => {
                    const isSelected = selectedIds.includes(member.id);
                    return (
       
                        <ListGroup.Item 
                            key={member.id}
                            action // [유지] 클릭 가능하게
                            
                            /* [수정 2] 'active' 속성을 제거합니다.
                              [cite_start]이 속성이 탭을 파랗게 만드는 주범입니다. [cite: 11]
                            */
                            // active={isSelected} 
                            
                            onClick={() => handleToggleSelect(member.id)}
                            
                            /* [수정 1] "py-3" 클래스를 추가해서 리스트를 더 크게 만듭니다.
                            */
                            className="d-flex justify-content-between align-items-center py-3"
                        >
                            {member.name}

                            <Form.Check 
                                type="checkbox"
                                checked={isSelected} // [유지] 체크박스 상태는 그대로 둡니다.
                                onChange={() => handleToggleSelect(member.id)}
                                onClick={(e) => e.stopPropagation()} // ListGroup 클릭 방지
                            />
                        
                        </ListGroup.Item>
                    );
                })}

                {deletableMembers.length === 0 && (
                    <p className="text-center text-muted mt-3">삭제 가능한 회원이 없습니다.</p>
                )}
            </ListGroup>
        </Modal.Body>

        {/* 3. 푸터 (버튼) */}
        <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => { setSelectedIds([]); onClose(); }}>
                취소
            </Button>
            <Button 
                variant="danger" // 🔑 btn-delete-mode-toggle -> variant="danger"
                onClick={handleFinalDelete}
                disabled={isConfirmDisabled} // 🔑 disabled 로직은 그대로
            >
                삭제하기 ({selectedCount}명)
            </Button>
        </Modal.Footer>
    </Modal>
    ); 
}

export default MemberDeleteModal;