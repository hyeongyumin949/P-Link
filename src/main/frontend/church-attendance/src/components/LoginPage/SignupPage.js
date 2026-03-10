import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, FloatingLabel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { toast } from 'react-toastify';

function SignupPage() {
    const navigate = useNavigate();
    
    // 입력 데이터 상태
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        passwordConfirm: '',
        name: '',
        role: 2, // 기본값: 속장(2)
        topGroupId: '', // 1차 선택 (교구)
        subGroupId: ''  // 2차 선택 (속)
    });
    
    // 드롭다운 목록 상태
    const [topGroups, setTopGroups] = useState([]);
    const [subGroups, setSubGroups] = useState([]);

    // 1. 화면 렌더링 시 1차(최상위 교구) 목록 불러오기
    useEffect(() => {
        apiClient.get('/api/auth/groups/top-level')
            .then(response => setTopGroups(response.data))
            .catch(error => toast.error("교구 목록을 불러오지 못했습니다."));
    }, []);

    // 2. 1차 교구 선택 시 하위 속 목록 불러오기 (속장일 경우에만)
    useEffect(() => {
        if (formData.role === 2 && formData.topGroupId) {
            apiClient.get(`/api/auth/groups/${formData.topGroupId}/sub-groups`)
                .then(response => {
                    setSubGroups(response.data);
                    // 1차 교구가 바뀌면 2차 선택은 초기화
                    setFormData(prev => ({ ...prev, subGroupId: '' })); 
                })
                .catch(error => toast.error("속 목록을 불러오지 못했습니다."));
        }
    }, [formData.topGroupId, formData.role]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // role을 바꿀 땐 숫자형으로 변환 및 소속 선택 초기화
        if (name === 'role') {
            setFormData(prev => ({ 
                ...prev, 
                role: Number(value),
                topGroupId: '',
                subGroupId: ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.passwordConfirm) {
            toast.error("비밀번호가 일치하지 않습니다.");
            return;
        }

        // 직책에 따른 최종 groupId 결정
        const finalGroupId = formData.role === 1 ? formData.topGroupId : formData.subGroupId;
        
        if (!finalGroupId) {
            toast.warning("소속을 끝까지 선택해주세요.");
            return;
        }

        try {
            const response = await apiClient.post('/api/auth/signup', {
                username: formData.username,
                password: formData.password,
                name: formData.name,
                role: formData.role,
                groupId: finalGroupId
            });
            
            // 성공 시 알림 띄우고 로그인 페이지로 이동
            toast.success(response.data || "회원가입 신청이 완료되었습니다.");
            navigate('/'); 
            
        } catch (error) {
            toast.error(error.response?.data || "회원가입에 실패했습니다.");
        }
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
            <Card className="shadow-sm border-0" style={{ width: '100%', maxWidth: '500px', borderRadius: '12px' }}>
                <Card.Body className="p-4 p-md-5">
                    
                    <div className="text-center mb-4">
                        <h2 className="h4 fw-bold">회원가입</h2>
                        <p className="text-muted small">앱 사용을 위해 가입 및 승인이 필요합니다.</p>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        
                        <FloatingLabel controlId="formEmail" label="이메일 (아이디)" className="mb-3">
                            <Form.Control type="email" name="username" placeholder="name@example.com" value={formData.username} onChange={handleChange} required />
                        </FloatingLabel>

                        <FloatingLabel controlId="formPassword" label="비밀번호" className="mb-3">
                            <Form.Control type="password" name="password" placeholder="비밀번호" value={formData.password} onChange={handleChange} required />
                        </FloatingLabel>

                        <FloatingLabel controlId="formPasswordConfirm" label="비밀번호 확인" className="mb-3">
                            <Form.Control type="password" name="passwordConfirm" placeholder="비밀번호 확인" value={formData.passwordConfirm} onChange={handleChange} required />
                        </FloatingLabel>

                        <FloatingLabel controlId="formName" label="이름" className="mb-4">
                            <Form.Control type="text" name="name" placeholder="홍길동" value={formData.name} onChange={handleChange} required />
                        </FloatingLabel>

                        <hr className="my-4" />

                        {/* 1. 직책 선택 (라디오 버튼) */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold mb-2">가입 직책 선택</Form.Label>
                            <div className="d-flex gap-3">
                                <Form.Check type="radio" id="role-1" name="role" label="교구장" value={1} checked={formData.role === 1} onChange={handleChange} />
                                <Form.Check type="radio" id="role-2" name="role" label="속장" value={2} checked={formData.role === 2} onChange={handleChange} />
                            </div>
                        </Form.Group>

                        {/* 2. 1차 소속 선택 (교구/목장) */}
                        <Form.Group className="mb-3">
                            <Form.Select name="topGroupId" value={formData.topGroupId} onChange={handleChange} required style={{ height: '58px' }}>
                                <option value="">소속 교구/목장을 선택하세요</option>
                                {topGroups.map(group => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* 3. 2차 소속 선택 (속장일 경우에만 렌더링) */}
                        {formData.role === 2 && formData.topGroupId && (
                            <Form.Group className="mb-3 animate__animated animate__fadeIn">
                                <Form.Select name="subGroupId" value={formData.subGroupId} onChange={handleChange} required style={{ height: '58px' }}>
                                    <option value="">담당 속을 선택하세요</option>
                                    {subGroups.map(group => (
                                        <option key={group.id} value={group.id}>{group.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        )}

                        <Button variant="primary" type="submit" className="w-100 fw-bold py-3 mt-3">
                            가입 신청하기
                        </Button>
                        
                        <Button variant="link" className="w-100 mt-2 text-decoration-none text-muted" onClick={() => navigate('/')}>
                            로그인 화면으로 돌아가기
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default SignupPage;