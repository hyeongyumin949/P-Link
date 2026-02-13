import React, { useState, useEffect } from 'react';
// 1. [신규] ListGroup import
import { Container, Card, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { toast } from 'react-toastify';

// 2. [신규] 날짜 포맷 헬퍼 (ReservationNew.js에서 가져옴)
const formatDisplayDate = (dateString) => {
    const date = new Date(dateString.replace(/-/g, '/'));
    const options = { month: 'long', day: 'numeric', weekday: 'long' };
    return date.toLocaleDateString('ko-KR', options);
};

function ReservationMyBooking() {
    const navigate = useNavigate();
    // 3. [수정] 단일 'booking' -> 'bookings' (배열)
    const [bookings, setBookings] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);

    // 4. [수정] /api/reservation/my-bookings (복수형) 호출
    const fetchMyBookings = () => {
        setIsLoading(true);
        // [API 5 - 수정] /api/reservation/my-bookings (복수형)
        apiClient.get('/api/reservation/my-bookings')
            .then(response => {
                setBookings(response.data); // 5. 배열을 state에 저장
            })
            .catch(error => {
                toast.error("예약 정보를 불러오는 데 실패했습니다.");
                setBookings([]); // 실패 시 빈 배열
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchMyBookings();
    }, []); // 1회 로드

    // 6. [수정] 예약 취소 핸들러 (ID를 인자로 받음)
    const handleCancelBooking = (bookingId) => {
        if (!bookingId || !window.confirm("정말로 이 예약을 취소하시겠습니까?")) {
            return;
        }

        // [API 6] DELETE /api/reservation/{id}
        apiClient.delete(`/api/reservation/${bookingId}`)
            .then(() => {
                toast.success("예약이 취소되었습니다.");
                // 7. [수정] 취소 성공 시 '목록'을 새로고침 (페이지 이동 X)
                fetchMyBookings(); 
            })
            .catch(error => {
                toast.error(error.response?.data?.message || "예약 취소에 실패했습니다.");
            });
    };

    if (isLoading) {
        return <div className="text-center p-5"><Spinner animation="border" /> 예약 정보를 로드 중...</div>;
    }

    // 8. [수정] 'bookings'가 0개일 때의 UI
    if (bookings.length === 0) {
        return (
            <Container className="py-3 text-center" style={{ maxWidth: '600px' }}>
                <Alert variant="info">
                    예약된 내역이 없습니다.
                </Alert>
                <Button variant="primary" onClick={() => navigate('/reservation')}>
                    예약하러 가기
                </Button>
            </Container>
        );
    }

    // 9. [수정] 예약 목록 렌더링
    return (
        <Container className="py-3" style={{ maxWidth: '600px' }}>
            <Card className="shadow-sm">
                <Card.Header as="h4" className="text-primary">
                    나의 예약 현황 (오늘 이후)
                </Card.Header>
                {/* [신규] ListGroup으로 목록 렌더링 */}
                <ListGroup variant="flush">
                    {bookings.map(booking => (
                        <ListGroup.Item key={booking.id} className="p-3">
                            <div className="d-flex justify-content-between align-items-start">
                                {/* 예약 정보 */}
                                <div>
                                    <h5 className="mb-1">{booking.placeName}</h5>
                                    <p className="mb-1 text-muted">
                                        {formatDisplayDate(booking.date)} / {booking.time}
                                    </p>
                                    <p className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>
                                        {booking.reason}
                                    </p>
                                </div>
                                {/* 취소 버튼 */}
                                <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => handleCancelBooking(booking.id)}
                                >
                                    취소
                                </Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card>
        </Container>
    );
}

export default ReservationMyBooking;