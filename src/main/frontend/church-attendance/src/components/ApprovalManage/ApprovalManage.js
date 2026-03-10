import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Button, Badge } from 'react-bootstrap';
import apiClient from '../../api/apiClient';
import { toast } from 'react-toastify';
import { useMemberContext } from '../../MemberContext';

function ApprovalManage() {
    const { user } = useMemberContext();
    const [pendingUsers, setPendingUsers] = useState([]);

    const fetchPendingUsers = () => {
        apiClient.get('/api/approvals')
            .then(res => setPendingUsers(res.data))
            .catch(err => toast.error("목록을 불러오는 데 실패했습니다."));
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleApprove = async (userId) => {
        if (!window.confirm("가입을 승인하시겠습니까?")) return;
        try {
            await apiClient.put(`/api/approvals/${userId}/approve`);
            toast.success("승인 완료되었습니다.");
            fetchPendingUsers(); // 목록 새로고침
        } catch (error) {
            toast.error("승인 처리에 실패했습니다.");
        }
    };

    const handleReject = async (userId) => {
        if (!window.confirm("가입을 거절(삭제)하시겠습니까?")) return;
        try {
            await apiClient.delete(`/api/approvals/${userId}/reject`);
            toast.success("가입이 거절되었습니다.");
            fetchPendingUsers(); // 목록 새로고침
        } catch (error) {
            toast.error("거절 처리에 실패했습니다.");
        }
    };

    return (
        <Container className="py-3">
            <h3 className="h4 text-primary mb-3 text-center border-bottom pb-3">
                {user?.role === 0 ? "교구장 가입 승인" : "속장 가입 승인"}
            </h3>

            <Card className="shadow-sm">
                <ListGroup variant="flush">
                    {pendingUsers.length === 0 ? (
                        <ListGroup.Item className="text-center p-5 text-muted">
                            승인 대기 중인 사용자가 없습니다.
                        </ListGroup.Item>
                    ) : (
                        pendingUsers.map(u => (
                            <ListGroup.Item key={u.id} className="p-3 d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="fw-bold fs-5">
                                        {u.name} <Badge bg="secondary" className="ms-2">{u.role === 1 ? '교구장' : '속장'}</Badge>
                                    </div>
                                    <div className="text-muted small">
                                        소속: {u.groupName} | 아이디: {u.username}
                                    </div>
                                </div>
                                <div>
                                    <Button variant="success" size="sm" className="me-2" onClick={() => handleApprove(u.id)}>
                                        승인
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleReject(u.id)}>
                                        거절
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))
                    )}
                </ListGroup>
            </Card>
        </Container>
    );
}

export default ApprovalManage;