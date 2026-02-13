import React, { useState, useEffect } from 'react';
import { Form, Button, FloatingLabel } from 'react-bootstrap'; // 1. Bootstrap import
import { useNoticeContext } from '../../NoticeContext';
import { toast } from 'react-toastify';

function NoticeWrite({ onSave, editNoticeId }) {
    const { createNotice, getNoticeDetail, updateNotice } = useNoticeContext(); 
    
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isImportant, setIsImportant] = useState(false);

    const isEditMode = !!editNoticeId; 

    // 🔑 5. [신규] 수정 모드일 때, useEffect로 기존 데이터 불러오기
    useEffect(() => {
        if (isEditMode) {
            const loadNoticeData = async () => {
                const notice = await getNoticeDetail(editNoticeId);
                if (notice) {
                    setTitle(notice.title);
                    setContent(notice.content);
                    setIsImportant(notice.isImportant);
                }
            };
            loadNoticeData();
        }
    }, [isEditMode, editNoticeId, getNoticeDetail]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.error("제목과 내용을 모두 입력해주세요.");
            return;
        }
        const noticeData = { title, content, isImportant };
        let isSuccess;

        if (isEditMode) {
            // 🔑 6. [수정] 수정 모드일 때 updateNotice 호출
            isSuccess = await updateNotice(editNoticeId, noticeData);
        } else {
            // 🔑 (기존) 생성 모드일 때 createNotice 호출
            isSuccess = await createNotice(noticeData);
        }
        
        if (isSuccess) {
            onSave(); // 뷰 전환
        }
    };

    return (
        <div>
            <h2 className="h4 mb-3 pb-3 border-bottom">{isEditMode ? '공지사항 수정' : '공지사항 작성'}</h2>
            {/* 2. <Form> 컴포넌트 사용 */}
            <Form onSubmit={handleSubmit}>
                
                {/* 3. '필독' 체크박스 */}
                <Form.Group className="mb-3" controlId="formIsImportant">
                    <Form.Check 
                        type="checkbox"
                        label="필독 공지로 지정"
                        checked={isImportant}
                        onChange={(e) => setIsImportant(e.target.checked)}
                        className="text-danger fw-bold"
                    />
                </Form.Group>
                
                {/* 4. 제목 입력 (FloatingLabel 사용) */}
                <FloatingLabel controlId="formTitle" label="제목" className="mb-3">
                    <Form.Control 
                        type="text"
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </FloatingLabel>

                {/* 5. 내용 입력 */}
                <FloatingLabel controlId="formContent" label="내용" className="mb-3">
                    <Form.Control
                        as="textarea"
                        placeholder="공지 내용을 입력하세요"
                        style={{ height: '200px' }}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </FloatingLabel>

                {/* 6. 액션 버튼 */}
                <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button variant="outline-secondary" onClick={onSave}>
                        취소
                    </Button>
                    <Button variant="primary" type="submit">
                        {isEditMode ? '수정 완료' : '작성 완료'}
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default NoticeWrite;