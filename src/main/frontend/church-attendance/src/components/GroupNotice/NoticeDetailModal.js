import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, Badge, CloseButton } from 'react-bootstrap'; // 1. Bootstrap import
import { useNoticeContext } from '../../NoticeContext';
import { useMemberContext } from '../../MemberContext';
import { InputGroup } from 'react-bootstrap';

function NoticeDetailModal({ isOpen, onClose, noticeId, onEdit }) {
    const { getNoticeDetail, createComment, deleteComment, deleteNotice, canWrite } = useNoticeContext();
    const { user } = useMemberContext(); 

    const [notice, setNotice] = useState(null); 
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchDetail = async () => {
        if (!noticeId) return;
        setIsLoading(true);
        const data = await getNoticeDetail(noticeId);
        setNotice(data);
        setIsLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            fetchDetail();
        }
    }, [isOpen, noticeId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        const isSuccess = await createComment(noticeId, { content: newComment });
        if (isSuccess) {
            setNewComment('');
            await fetchDetail(); // 댓글 목록 새로고침
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
            const isSuccess = await deleteComment(commentId);
            if (isSuccess) {
                await fetchDetail(); // 🔑 댓글 삭제 성공 시, 모달 데이터 새로고침
            }
        }
    };

    const handleDeleteNotice = async () => {
        if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?\n(모든 댓글이 함께 삭제됩니다.)")) {
            const isSuccess = await deleteNotice(noticeId);
            if (isSuccess) {
                onClose(); // 🔑 삭제 성공 시 모달 닫기 (목록은 Context가 갱신)
            }
        }
    };

    return (
        // 2. <Modal> 컴포넌트 사용 (size="lg"로 넓게)
        <Modal show={isOpen} onHide={onClose} size="lg" centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title as="h5">
                    {notice?.isImportant && <Badge bg="danger" className="me-2">필독</Badge>}
                    {notice?.title || '로딩 중...'}
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
                {isLoading || !notice ? (
                    <div>로딩 중...</div>
                ) : (
                    <>
                        {/* 1. 게시글 메타 정보 */}
                        <div className="text-muted small mb-3 border-bottom pb-3">
                            <span>작성자: {notice.authorName}</span>
                            <span className="ms-3">
                                작성일: {new Date(notice.createdDate).toLocaleString('ko-KR')}
                            </span>
                        </div>
                        
                        {/* 2. 내용 본문 */}
                        <div className="mb-4" style={{ minHeight: '100px', whiteSpace: 'pre-wrap' }}>
                            {notice.content}
                        </div>

                        {/* 3. 댓글 섹션 */}
                        <hr />
                        <h6 className="mb-3">댓글 ({notice.comments.length}개)</h6>
                        
                        {/* 3-1. 댓글 입력 폼 */}
                        <Form onSubmit={handleCommentSubmit} className="mb-3">
                            <InputGroup>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={`${user.name}님, 댓글을 입력하세요...`}
                                />
                                <Button variant="outline-secondary" type="submit">등록</Button>
                            </InputGroup>
                        </Form>
                        
                        {/* 3-2. 댓글 목록 */}
                        <ListGroup variant="flush">
                            {notice.comments.map(comment => (
                                <ListGroup.Item key={comment.id} className="px-0">
                                    <div className="d-flex justify-content-between">
                                        <span className="fw-bold small">{comment.authorName}</span>
                                        
                                        {/* 🔑 [수정] comment.isAuthor -> comment.author */}
                                        {comment.author && (
                                            <CloseButton 
                                                onClick={() => handleDeleteComment(comment.id)} 
                                                title="삭제"
                                            />
                                        )}
                                    </div>
                                    <p className="mb-1">{comment.content}</p>
                                    {/* ... (날짜) ... */}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </>
                )}
            </Modal.Body>
            
            <Modal.Footer>
                {(notice && (notice.author || canWrite)) && (
                    <Button variant="outline-primary" onClick={() => onEdit(noticeId)}>
                        수정
                    </Button>
                )}
                
                {(notice && (notice.author || canWrite)) && (
                    <Button variant="outline-danger" onClick={handleDeleteNotice} className="me-auto">
                        게시글 삭제
                    </Button>
                )}

                <Button variant="secondary" onClick={onClose}>
                    닫기
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
export default NoticeDetailModal;