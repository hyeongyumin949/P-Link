import React from 'react';
import { ListGroup, Button, Badge } from 'react-bootstrap'; // 1. Bootstrap import

function NoticeList({ notices, canWrite, onWriteClick, onNoticeClick }) {
    
    // 개별 공지사항 항목
    const NoticeListItem = ({ notice }) => (
        // [수정] align-items-start -> align-items-center로 변경 (수직 중앙 정렬)
        <ListGroup.Item 
            action 
            onClick={() => onNoticeClick(notice.id)} 
            className="d-flex justify-content-between align-items-center p-3 mb-2 shadow-sm border rounded"
        >
            {/* 1. 왼쪽 영역 (제목 + 날짜) */}
            {/* 'me-auto'가 이 블록을 왼쪽에, '작성자'를 오른쪽 끝으로 밀어냅니다. */}
            <div className="ms-2 me-auto">
                {/* [수정 1] 제목을 'fs-5'로 키웁니다. (fw-bold는 이미 있음) */}
                <div className="fw-bold fs-5">
                    {notice.isImportant && <Badge bg="danger" className="me-2">필독</Badge>}
                    {notice.title}
                </div>
                {/* 날짜는 제목 아래에 그대로 둡니다. */}
                <div className="text-muted small mt-1">
                    <span>{new Date(notice.createdDate).toLocaleDateString('ko-KR')}</span> 
                </div>
            </div>

            {/* 2. 오른쪽 영역 (작성자 이름만) */}
            {/* [수정 2] "작성자:" 텍스트를 제거하고 이름만 표시합니다. */}
            <span className="text-muted small ms-3">{notice.authorName}</span>
        </ListGroup.Item>
    );

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                <h2 className="h4 mb-0">교구 공지사항</h2>
                {/* 4. '글쓰기' 버튼 */}
                {canWrite && (
                    <Button variant="primary" onClick={onWriteClick}>
                        + 공지사항 작성
                    </Button>
                )}
            </div>

            {/* 5. 공지사항 목록 */}
            <ListGroup variant="flush"> 
                {notices.length > 0 ? (
                    notices.map(notice => (
                        <NoticeListItem key={notice.id} notice={notice} />
                    ))
                ) : (
                    <p className="text-center text-muted p-3">등록된 공지사항이 없습니다.</p>
                )}
            </ListGroup>
        </div>
    );
}

export default NoticeList;