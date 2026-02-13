import React, { useState } from 'react';
import { Container, Card, Form, Button, Image, FloatingLabel } from 'react-bootstrap';
// 🔑 수정: axios 대신 커스텀 apiClient 임포트 (경로 수정 필요)
import apiClient from '../../api/apiClient'; 
import { useMemberContext } from '../../MemberContext'; 
import { toast } from 'react-toastify';

function LoginPage() { 
    // Context에서 loginUser 액션 함수를 가져옵니다.
    const { loginUser } = useMemberContext(); 
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // 🔑 apiClient.post 사용 (Interceptor가 자동으로 헤더에 토큰을 추가하지만, 로그인 요청에는 토큰이 필요 없음)
            const response = await apiClient.post('/api/auth/login', {
                username: username,
                password: password,
            }); 
            
            // 인증 성공 (200 OK)
            if (response.status === 200 && response.data) {
                const userData = response.data;
                
                // 🔑 1. LocalStorage에 JWT 토큰 저장 (핵심)
                localStorage.setItem('jwt_token', userData.token);
                // 2. Context에 저장할 토큰이 제거된 순수 사용자 정보 페이로드 생성
                const userPayload = {
                    id: userData.id,
                    name: userData.name,
                    role: userData.role,
                    groupName: userData.groupName,
                    isYouth: userData.youth
                };
                // 3. Context 상태 업데이트
                loginUser(userPayload);
                
                toast.success(`환영합니다, ${userData.name}님`);
                // 로그인 성공 후 메인 페이지 등으로 리다이렉션 로직 추가 필요 (예: useNavigate)
            }
        } catch (error) {
            // 🔑 인증 실패 (401 Unauthorized) 처리
            console.error("Login Error:", error.response || error.message); 
            
            // 서버에서 보낸 에러 메시지 추출 및 표시
            const errorMessage = error.response && error.response.data 
                ? error.response.data.split(': ')[1] 
                : "아이디 또는 비밀번호를 확인해주세요.";
                
            toast.error(`로그인 실패: ${errorMessage}`);
        }
    };

    return (
    // 🔑 .login-page-container -> <Container>
    <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f4f7f6' }}>

        {/* 🔑 .login-card -> <Card> */}
        <Card className="shadow-sm border-0" style={{ width: '100%', maxWidth: '400px', borderRadius: '12px' }}>
            <Card.Body className="p-4 p-md-5 text-center">

                {/* 🔑 .organization-logo -> <Image> */}
                <Image 
                    src="/logo.png" 
                    alt="앱 로고"
                    className="mb-4"
                    style={{ maxWidth: '220px' }}
                />

                <h2 className="h4 mb-4">로그인</h2>

                {/* 🔑 form -> <Form> */}
                <Form onSubmit={handleSubmit}>

                    {/* 🔑 div.input-group -> <FloatingLabel> */}
                    <FloatingLabel controlId="formUsername" label="아이디" className="mb-3 text-muted">
                        <Form.Control 
                            type="text"
                            name="username"
                            placeholder="아이디를 입력하세요"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required
                        />
                    </FloatingLabel>

                    <FloatingLabel controlId="formPassword" label="비밀번호" className="mb-3 text-muted">
                        <Form.Control 
                            type="password"
                            name="password"
                            placeholder="비밀번호를 입력하세요"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                        />
                    </FloatingLabel>

                    {/* 🔑 button.login-button -> <Button> */}
                    <Button variant="primary" type="submit" className="w-100 fw-bold py-2 mt-2">
                        로그인
                    </Button>
                </Form>

                <div className="mt-4 small">
                    <a href="#" className="text-decoration-none mx-2">비밀번호 찾기</a>
                    |
                    <a href="#" className="text-decoration-none mx-2">회원가입/문의</a>
                </div>

            </Card.Body>
        </Card>
     </Container>
    );
}

export default LoginPage;