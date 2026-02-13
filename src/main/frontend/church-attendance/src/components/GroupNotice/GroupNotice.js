import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap'; // 🔑 1. Bootstrap 컨테이너 import
import { useNoticeContext } from '../../NoticeContext';
import NoticeList from './NoticeList';      
import NoticeWrite from './NoticeWrite';
import NoticeDetailModal from './NoticeDetailModal'; 

function GroupNotice() {
    const { 
        notices,
        isLoading,
        canWrite,
        fetchNotices
    } = useNoticeContext();
    
    const [currentView, setCurrentView] = useState('list');
    const [selectedNoticeId, setSelectedNoticeId] = useState(null);
    
    // 컴포넌트가 처음 로드될 때 공지사항 목록 불러오기
    useEffect(() => {
        fetchNotices();
    }, []); 

    // 뷰 전환 핸들러
    const handleViewChange = (viewName, noticeId = null) => {
        setCurrentView(viewName);
        setSelectedNoticeId(noticeId);
    };

    const handleEditClick = (id) => {
        handleViewChange('write', id); // 'write' 뷰로 전환, noticeId 설정
    };

    // 뷰 렌더링 로직
    const renderView = () => {
        if (isLoading) {
            return <div>공지사항을 불러오는 중입니다...</div>;
        }

        switch (currentView) {
            case 'write':
                // "작성 완료" 또는 "취소" 시 'list' 뷰로 돌아감
                return <NoticeWrite onSave={() => handleViewChange('list')}
                        editNoticeId={selectedNoticeId} />;
            case 'list':
            default:
                return (
                    <NoticeList 
                        notices={notices}
                        canWrite={canWrite}
                        onNoticeClick={(id) => handleViewChange('detail', id)}
                        onWriteClick={() => handleViewChange('write')}
                    />
                );
        }
    };

    return (
        // 🔑 2. Bootstrap의 <Container>로 감싸서 UI 정렬
        <Container className="py-3">
            {renderView()}

            {/* 3. 상세보기 모달은 뷰와 상관없이 렌더링 (isOpen으로 제어) */}
            <NoticeDetailModal
                isOpen={currentView === 'detail'}
                onClose={() => handleViewChange('list')}
                noticeId={selectedNoticeId}
                onEdit={handleEditClick}
            />
        </Container>
    );
}

export default GroupNotice;