// App.js
import React from 'react';
import LoginPage from './components/LoginPage/LoginPage';
import MainLayout from './components/MainLayout/MainLayout';
import { MemberProvider, useMemberContext } from './MemberContext'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NoticeProvider } from './NoticeContext';
import './bootstrap.min.css';

// 1. react-router-dom에서 필요한 것들을 import 합니다.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 2. (신규) 로그인 페이지 래퍼
//    - 로그인 상태면 메인(/)으로, 아니면 로그인 페이지를 보여줍니다.
const LoginPageWrapper = () => {
    const { user, isLoading } = useMemberContext();
    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>로딩 중...</div>;
    }
    return !user ? <LoginPage /> : <Navigate to="/" replace />;
};

// 3. (신규) 보호된 경로 래퍼 (기존 AppContent 로직)
//    - 로그인 상태면 MainLayout을, 아니면 로그인 페이지(/login)로 보냅니다.
const ProtectedRoute = () => {
    const { user, logoutUser, isLoading } = useMemberContext();

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>
                   인증 정보를 확인 중입니다...
               </div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // 로그아웃 핸들러를 MainLayout에 전달합니다.
    const handleLogout = () => {
        logoutUser(); 
        // logoutUser()가 실행되면 user가 null이 되고,
        // 이 컴포넌트가 다시 렌더링되어 자동으로 /login으로 이동됩니다.
    };

    // 4. MainLayout이 이제 하위 모든 경로(/*)를 담당합니다.
    return <MainLayout user={user} onLogout={handleLogout} />; 
};

// 5. App 함수 구조 변경
function App() {
    return (
        <MemberProvider>
            <NoticeProvider> 
                {/* 6. BrowserRouter가 Routes를 감쌉니다. */}
                <BrowserRouter>
                    <Routes>
                        {/* 7. 경로 설정 */}
                        <Route path="/login" element={<LoginPageWrapper />} />
                        <Route path="/*" element={<ProtectedRoute />} />
                    </Routes>
                </BrowserRouter>
                <ToastContainer autoClose={3000} hideProgressBar />
            </NoticeProvider>
        </MemberProvider>
    );
}

export default App;