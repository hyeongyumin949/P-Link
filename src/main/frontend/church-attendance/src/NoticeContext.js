import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from './api/apiClient';
import { useMemberContext } from './MemberContext'; // 🔑 MemberContext를 가져옴
import { toast } from 'react-toastify';

// 1. Context 객체 생성
const NoticeContext = createContext();

// 2. Provider 컴포넌트 정의
export const NoticeProvider = ({ children }) => {
    const [notices, setNotices] = useState([]); // 공지사항 목록
    const [isLoading, setIsLoading] = useState(true);
    const { user, isLoading: isUserLoading } = useMemberContext();

    // 3. (글쓰기 권한 확인) 
    // "ROLE 1 또는 4" + "parent_id가 null인 교구장"
    const canWrite = user && (user.role === 1 || user.role === 4);

    /**
     * [참고] 위 'parishGroupId'를 쓰려면, 백엔드 AuthDto.LoginResponse에
     * user.getGroup().getParent()가 null인지 여부(또는 parent_id 자체)를
     * 프론트엔드로 보내주도록 수정이 필요할 수 있습니다.
     * * 우선은 'user.parishGroupId'라는 키로 진행하겠습니다.
     */

    /**
     * 4. [API] 공지사항 목록 불러오기 (GET /api/notice)
     * (로그인한 user의 교구 목록만 불러옴)
     */
    const fetchNotices = async () => {
        // 🔑 4-1. [추가] user가 'null'이면 API를 호출하지 않고 즉시 중단합니다.
        if (!user) {
            console.log("[NoticeContext] 사용자가 null이므로 공지사항 로드를 건너뜁니다.");
            setIsLoading(false); // (공지사항 로딩은 '완료'된 것으로 간주)
            return; 
        }
        
        setIsLoading(true);
        try {
            const response = await apiClient.get('/api/notice');
            setNotices(response.data);
        } catch (error) {
            console.error("공지사항 로드 실패:", error);
            // (403 에러가 나면 여기서 toast가 뜰 수 있습니다)
            toast.error("공지사항을 불러오지 못했습니다.");
        }
        setIsLoading(false);
    };

    /**
     * 5. [API] 공지사항 상세 조회 (GET /api/notice/{id})
     * (댓글 포함)
     */
    const getNoticeDetail = async (noticeId) => {
        try {
            const response = await apiClient.get(`/api/notice/${noticeId}`);
            return response.data; // (댓글 목록이 포함된 DTO 반환)
        } catch (error) {
            console.error("공지사항 상세 조회 실패:", error);
            toast.error("게시글을 불러오는 데 실패했습니다.");
            return null;
        }
    };

    /**
     * 6. [API] 공지사항 작성 (POST /api/notice)
     */
    const createNotice = async (noticeData) => {
        try {
            await apiClient.post('/api/notice', noticeData);
            toast.success("공지사항이 등록되었습니다.");
            await fetchNotices(); // 목록 새로고침
            return true; // 성공
        } catch (error) {
            console.error("공지사항 작성 실패:", error);
            toast.error("공지사항 작성에 실패했습니다.");
            return false; // 실패
        }
    };

    /**
     * 7. [API] 댓글 작성 (POST /api/notice/{id}/comments)
     */
    const createComment = async (noticeId, commentData) => {
        try {
            await apiClient.post(`/api/notice/${noticeId}/comments`, commentData);
            toast.success("댓글이 등록되었습니다.");
            return true; // 성공 (상세보기 모달이 댓글 목록을 새로고침해야 함)
        } catch (error) {
            console.error("댓글 작성 실패:", error);
            toast.error("댓글 등록에 실패했습니다.");
            return false; // 실패
        }
    };

    const deleteComment = async (commentId) => {
        try {
            await apiClient.delete(`/api/notice/comments/${commentId}`);
            toast.success("댓글이 삭제되었습니다.");
            return true; // 성공
        } catch (error) {
            console.error("댓글 삭제 실패:", error);
            toast.error(error.response?.data || "댓글 삭제에 실패했습니다.");
            return false; // 실패
        }
    };

    const deleteNotice = async (noticeId) => {
        try {
            await apiClient.delete(`/api/notice/${noticeId}`);
            toast.success("게시글이 삭제되었습니다.");
            await fetchNotices(); // 🔑 [중요] 목록 새로고침
            return true; // 성공
        } catch (error) {
            console.error("게시글 삭제 실패:", error);
            toast.error(error.response?.data || "게시글 삭제에 실패했습니다.");
            return false; // 실패
        }
    };

    // 8. user가 변경(로그인)될 때마다 공지사항 목록 갱신
    useEffect(() => {
        // 🔑 5-1. MemberContext가 아직 로딩 중(isUserLoading)이면 기다립니다.
        if (isUserLoading) {
            console.log("[NoticeContext] MemberContext 로딩 대기 중...");
            return; 
        }
        
        // 🔑 5-2. 로딩이 끝났을 때(isUserLoading=false) fetchNotices를 호출
        fetchNotices();

    }, [user, isUserLoading]);

    const updateNotice = async (noticeId, noticeData) => {
        try {
            await apiClient.put(`/api/notice/${noticeId}`, noticeData);
            toast.success("게시글이 수정되었습니다.");
            await fetchNotices(); // 목록 새로고침
            return true; // 성공
        } catch (error) {
            console.error("게시글 수정 실패:", error);
            toast.error(error.response?.data || "게시글 수정에 실패했습니다.");
            return false; // 실패
        }
    };

    const contextValue = {
        notices,
        isLoading,
        canWrite, // 🔑 글쓰기 가능 여부 (true/false)
        fetchNotices,
        getNoticeDetail,
        createNotice,
        createComment,
        deleteComment,
        deleteNotice,
        updateNotice
    };

    return (
        <NoticeContext.Provider value={contextValue}>
            {children}
        </NoticeContext.Provider>
    );
};

// 9. Custom Hook 정의
export const useNoticeContext = () => {
    return useContext(NoticeContext);
};