import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { useMemberContext } from '../../MemberContext'; 

function MemberFormModal({ isOpen, onClose, memberData, currentGroupName }) {
    
    const { addMember, updateMember, user } = useMemberContext(); 
    const isEditMode = !!memberData;

    const isYouthLeader = user ? user.isYouth : false;

    const [formData, setFormData] = useState({
        name: memberData?.name || '',
        contact: memberData?.contact || '',
        talent: memberData?.talent || 0 // 👈 [추가]
    });

    const [isFormChanged, setIsFormChanged] = useState(false);

    // memberData 변경 시 폼 초기화 및 isFormChanged 초기화
    useEffect(() => {
        const resetData = {
            name: memberData?.name || '',
            contact: memberData?.contact || '',
            talent: memberData?.talent || 0 // 👈 [추가]
        };
        setFormData(resetData);
        setIsFormChanged(false); 
    }, [memberData, isOpen]);
    
    // [핵심 로직] formData가 변경될 때마다 초기 데이터와 비교
    useEffect(() => {
        const currentData = { 
            name: formData.name.trim(),
            contact: formData.contact.trim(),
            // 🔑 talent는 숫자이므로 Number()로 형변환 후 비교
            talent: Number(formData.talent) // 👈 [추가]
        };
        const initialData = { 
            name: memberData?.name.trim() || '',
            contact: memberData?.contact.trim() || '',
            talent: memberData?.talent || 0 // 👈 [추가]
        };
        
        // 추가 모드에서는 이름만 입력해도 활성화
        if (!isEditMode && formData.name.trim() !== '') {
            setIsFormChanged(true);
            return;
        }

        // JSON.stringify를 사용하여 객체 내용 전체를 문자열로 비교
        const changed = JSON.stringify(currentData) !== JSON.stringify(initialData);
        setIsFormChanged(changed);
    }, [formData, memberData, isEditMode]);


    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const memberDataWithGroup = { ...formData, group: currentGroupName, talent: Number(formData.talent) };
        
        if (isEditMode) {
            updateMember({ ...memberDataWithGroup, id: memberData.id }); 
        } else {
            addMember(memberDataWithGroup); 
        }
        
        onClose();
    };
    
    // 버튼 비활성화 여부 결정: 추가 모드가 아니면서(수정 모드) 변경 사항이 없을 때 비활성화
    const isButtonDisabled = isEditMode ? !isFormChanged : false;


    return (
    // 🔑 div.modal-overlay -> <Modal>
    <Modal show={isOpen} onHide={onClose} centered>

        {/* 1. 헤더 */}
        <Modal.Header closeButton>
            <Modal.Title as="h5">
                {isEditMode ? '회원 정보 수정' : '새 회원 등록'}
            </Modal.Title>
        </Modal.Header>

        {/* 2. 본문 (Form) */}
        {/* 🔑 form -> <Form> (handleSubmit은 Form에 연결) */}
        <Form onSubmit={handleSubmit}>
            <Modal.Body>
                {/* 🔑 div.form-group -> <FloatingLabel> (더 깔끔한 UI) */}
                <FloatingLabel controlId="formMemberName" label="이름" className="mb-3">
                    <Form.Control 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="이름"
                        required 
                    />
                </FloatingLabel>

                <FloatingLabel controlId="formMemberContact" label="연락처" className="mb-3">
                    <Form.Control 
                        type="text" 
                        name="contact" 
                        value={formData.contact} 
                        onChange={handleChange} 
                        placeholder="연락처"
                    />
                </FloatingLabel>

                {/* 🔑 '누적 달란트' (로직은 그대로 유지) */}
                {isEditMode && isYouthLeader && (
                    <FloatingLabel controlId="formMemberTalent" label="누적 달란트" className="mb-3">
                        <Form.Control 
                            type="number" 
                            name="talent" 
                            value={formData.talent} 
                            onChange={handleChange} 
                            placeholder="누적 달란트" 
                        />
                    </FloatingLabel>
                )}
            </Modal.Body>

            {/* 3. 푸터 (버튼) */}
            <Modal.Footer>
                {/* 🔑 div.modal-actions -> <Modal.Footer> */}
                <Button variant="outline-secondary" onClick={onClose}>
                    취소
                </Button>
                <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isButtonDisabled}
                >
                    {isEditMode ? '수정하기' : '등록하기'}
                </Button>
            </Modal.Footer>
        </Form>
    </Modal>
    );
}
export default MemberFormModal;