import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, ListGroup, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { toast } from 'react-toastify';
import { useMemberContext } from '../../MemberContext';

// --- 1. 날짜 헬퍼 함수 (변경 없음) ---
const getWeekDays = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); 
    const diff = (currentDayOfWeek === 0) ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today.setDate(today.getDate() + diff));
    const week = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(date.getDate() + i);
        week.push({
            dateString: date.toISOString().split('T')[0],
            dayNum: date.getDate(),
            dayName: date.toLocaleDateString('ko-KR', { weekday: 'short' })
        });
    }
    return week;
};
const getTodayDateString = () => new Date().toISOString().split('T')[0];
const formatDisplayDate = (dateString) => {
    const date = new Date(dateString.replace(/-/g, '/'));
    const options = { month: 'long', day: 'numeric', weekday: 'long' };
    return date.toLocaleDateString('ko-KR', options);
};


function ReservationNew() {
    const navigate = useNavigate();
    const { user } = useMemberContext(); 

    // --- 2. 상태 정의 (변경 없음) ---
    const [weekDates, setWeekDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null); 
    const [places, setPlaces] = useState([]);
    const [selectedPlaceId, setSelectedPlaceId] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null); 
    const [reason, setReason] = useState('');
    const [isLoadingDates, setIsLoadingDates] = useState(true);
    const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [bookingCount, setBookingCount] = useState(0);
    const [bannerDate, setBannerDate] = useState(null); 

    // --- 3. useEffect 로직 (변경 없음) ---

    // 1. (최초 실행) '오늘' 기준으로 배너 + 날짜 로드
    useEffect(() => {
        if (!user) return; 
        setWeekDates(getWeekDays());
        setIsLoadingDates(false);
        const today = getTodayDateString();
        setBannerDate(today);

        if (user.role === 2 || user.role === 3) {
            apiClient.get(`/api/reservation/my-bookings-on-date?date=${today}`)
                .then(response => {
                    setBookingCount(response.data.length);
                })
                .catch(err => toast.error("초기 예약 상태 확인에 실패했습니다."));
        }
    }, [user]); 

    // 2. (날짜 선택 시) 장소 로드 + 배너 업데이트
    useEffect(() => {
        if (!selectedDate || !user) {
            setPlaces([]);
            setSlots([]);
            setSelectedPlaceId(null);
            setSelectedSlot(null);
            return;
        }

        setSlots([]);
        setSelectedPlaceId(null);
        setSelectedSlot(null);
        setReason('');
        setBannerDate(selectedDate);
        
        if (user.role === 2 || user.role === 3) {
            apiClient.get(`/api/reservation/my-bookings-on-date?date=${selectedDate}`)
                .then(response => {
                    const count = response.data.length;
                    setBookingCount(count);
                    if (count >= 2) {
                        toast.info("해당 날짜의 예약이 마감되었습니다. 예약 확인 페이지로 이동합니다.");
                        navigate('/reservation/my-booking');
                    }
                })
                .catch(err => toast.error("예약 상태 확인에 실패했습니다."));
        }

        setIsLoadingPlaces(true);
        apiClient.get('/api/places')
            .then(response => {
                setPlaces(response.data);
            })
            .catch(err => toast.error("장소 목록을 불러오는 데 실패했습니다."))
            .finally(() => setIsLoadingPlaces(false));
    }, [selectedDate, user, navigate]);

    // 3. (장소 선택 시) 시간 슬롯 로드
    useEffect(() => {
        if (!selectedPlaceId || !selectedDate) {
            setSlots([]);
            setSelectedSlot(null);
            return;
        }
        setIsLoadingSlots(true);
        setSelectedSlot(null);
        apiClient.get(`/api/places/${selectedPlaceId}/slots?date=${selectedDate}`)
            .then(response => {
                setSlots(response.data);
            })
            .catch(err => toast.error("예약 시간표를 불러오는 데 실패했습니다."))
            .finally(() => setIsLoadingSlots(false));
    }, [selectedPlaceId, selectedDate]); 

    // --- 4. 핸들러 (변경 없음) ---
    const handleDateClick = (dateString) => {
        setSelectedDate(dateString); 
    };

    const handleSlotClick = (slot) => {
        setSelectedSlot(slot); 
    };

    const handleBookingSubmit = () => {
        if (!reason.trim()) {
            toast.warn("모임 내용(사유)을 입력해주세요.");
            return;
        }
        apiClient.post('/api/reservation', {
            placeId: selectedPlaceId,
            time: selectedSlot.time,
            reason: reason,
            date: selectedDate 
        })
        .then(() => {
            toast.success("예약이 완료되었습니다.");
            if ((user.role === 2 || user.role === 3) && (bookingCount + 1 >= 2)) {
                navigate('/reservation/my-booking');
            } else {
                setBannerDate(null);
                setBannerDate(selectedDate);
                setSelectedPlaceId(null);
                setSelectedPlaceId(selectedPlaceId);
                setSelectedSlot(null); 
                setReason('');
            }
        })
        .catch(error => {
            toast.error(error.response?.data?.message || "예약에 실패했습니다.");
        });
    };

    // --- 5. 렌더링 함수 (변경 없음) ---
    const renderStatusBanner = () => {
        if (!user || (user.role !== 2 && user.role !== 3)) return null;
        if (bookingCount === 0 || !bannerDate) return null;
        const text = (bookingCount >= 2) ? "예약을 완료했습니다." : `현재 ${bookingCount}시간 예약 중입니다 (추가 예약 가능)`;
        return (
            <Alert variant={bookingCount >= 2 ? "warning" : "info"} className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">{formatDisplayDate(bannerDate)} - {text}</span>
                <Button size="sm" variant="dark" onClick={() => navigate('/reservation/my-booking')}>
                    내 예약 확인
                </Button>
            </Alert>
        );
    };

    const today = getTodayDateString(); // 👈 'const' 선언을 렌더링 함수 밖으로 이동

    const renderDatePicker = (
        <Card className="shadow-sm">
            <Card.Header as="h5">1. 날짜 선택</Card.Header>
            <Card.Body>
                {isLoadingDates && <Spinner animation="border" size="sm" />}
                <div className="d-flex flex-row flex-nowrap" style={{ overflowX: 'auto', paddingBottom: '10px' }}>
                    {weekDates.map(day => {
                        const isPast = day.dateString < today;
                        return (
                            <div 
                                key={day.dateString}
                                className={`me-2 p-2 text-center border rounded ${selectedDate === day.dateString ? 'border-primary border-3' : ''} ${isPast ? 'bg-light text-muted' : ''}`}
                                style={{ minWidth: '80px', cursor: isPast ? 'not-allowed' : 'pointer', opacity: isPast ? 0.7 : 1 }}
                                onClick={() => !isPast && handleDateClick(day.dateString)}
                            >
                                <div className="small text-muted">{day.dayNum}</div>
                                <div className="fs-5 fw-bold">{day.dayName}</div>
                            </div>
                        );
                    })}
                </div>
            </Card.Body>
        </Card>
    );

    const renderPlaces = (
        <div className="card shadow-sm">
            <div className="card-header"><h5>2. 장소 선택</h5></div>
            <div className="card-body">
                {isLoadingPlaces && <Spinner animation="border" size="sm" />}
                <div className="d-flex flex-row flex-nowrap" style={{ overflowX: 'auto', paddingBottom: '10px' }}>
                    {places.map(place => (
                        <div 
                            key={place.id}
                            className={`me-3 p-2 text-center border rounded ${selectedPlaceId === place.id ? 'border-primary border-3' : ''}`}
                            style={{ minWidth: '150px', cursor: 'pointer' }}
                            onClick={() => setSelectedPlaceId(place.id)}
                        >
                            <h6 className="fs-6 fw-bold">{place.name}</h6>
                            <p className="small text-muted mb-0">{place.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
    
    const renderTimeSlots = (
        <Card className="shadow-sm" style={{ minHeight: '200px' }}>
            <Card.Header as="h5">3. 시간 선택</Card.Header>
            <ListGroup variant="flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {isLoadingSlots && <ListGroup.Item className="text-center p-4"><Spinner animation="border" size="sm" /></ListGroup.Item>}
                {slots.map(slot => {
                    let variant = 'success';
                    let text = '예약 가능';
                    if (slot.status === 'BOOKED_BY_ME') {
                        variant = 'primary';
                        text = '내 예약';
                    } else if (slot.status === 'BOOKED_BY_OTHER') {
                        variant = 'danger';
                        text = '예약 불가';
                    }
                    return (
                        <ListGroup.Item
                            key={slot.time}
                            action 
                            variant={variant}
                            active={selectedSlot?.time === slot.time}
                            onClick={() => handleSlotClick(slot)}
                        >
                            <div className="d-flex justify-content-between">
                                <span className="fw-bold">{slot.time}</span>
                                <span>{text}</span>
                            </div>
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
        </Card>
    );

    // --- [수정] 6. 렌더링 - Panel 4 (상세/예약) ---
    const renderDetail = useMemo(() => {
        if (!selectedSlot) return null; 

        // [신규] 'parishName'과 'groupName'을 조합하는 로직
        const getFullGroupName = (slot) => {
            if (slot.parishName && slot.parishName !== "N/A") {
                return `${slot.parishName} - ${slot.groupName}`; // "A교구 - 7속"
            }
            return slot.groupName; // "7속" (교구가 없는 경우)
        };

        switch (selectedSlot.status) {
            case 'AVAILABLE':
                const isDisabled = (user?.role === 2 || user?.role === 3) && bookingCount >= 2;
                return (
                    <Card className="border-success">
                        <Card.Body>
                            <Card.Title className="text-success">예약하기</Card.Title>
                            <Form.Group className="mb-3">
                                <Form.Label>모임 내용 (사유)</Form.Label>
                                <Form.Control 
                                    as="textarea" rows={3}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="예: 7속 속모임"
                                    disabled={isDisabled}
                                />
                            </Form.Group>
                            <div className="d-grid">
                                <Button 
                                    variant="primary" 
                                    size="lg" 
                                    onClick={handleBookingSubmit}
                                    disabled={isDisabled}
                                >
                                    {isDisabled ? "예약 마감" : `${selectedSlot.time} 예약 확정`}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                );
            
            case 'BOOKED_BY_ME':
                return (
                    <Card className="border-primary">
                        <Card.Body>
                            <Card.Title className="text-primary">내 예약 정보</Card.Title>
                            {/* 💥 [수정] fullGroupName 표시 */}
                            <Card.Text><strong>예약 그룹:</strong> {getFullGroupName(selectedSlot)}</Card.Text>
                            <Card.Text><strong>예약자:</strong> {selectedSlot.reservedBy}</Card.Text>
                            <Card.Text><strong>모임 내용:</strong> {selectedSlot.reason}</Card.Text>
                            <Button variant="outline-primary" onClick={() => navigate('/reservation/my-booking')}>
                                내 예약 확인하러 가기
                            </Button>
                        </Card.Body>
                    </Card>
                );

            case 'BOOKED_BY_OTHER':
                return (
                    <Card className="border-danger">
                        <Card.Body>
                            <Card.Title className="text-danger">예약 정보 (타 그룹)</Card.Title>
                            {/* 💥 [수정] fullGroupName 표시 */}
                            <Card.Text><strong>예약 그룹:</strong> {getFullGroupName(selectedSlot)}</Card.Text>
                            <Card.Text><strong>예약자:</strong> {selectedSlot.reservedBy}</Card.Text>
                            <Card.Text><strong>모임 내용:</strong> {selectedSlot.reason}</Card.Text>
                        </Card.Body>
                    </Card>
                );

            default:
                return null; 
        }
    }, [selectedSlot, reason, bookingCount, user, navigate]); 

    // --- 7. 최종 렌더링 (변경 없음) ---
    return (
        <Container className="py-3">
            <Row className="justify-content-center">
                <Col xs={12} md={8}>
                    {renderStatusBanner()}
                    {renderDatePicker}
                    {selectedDate && (
                        <div className="mt-3">
                            {renderPlaces}
                        </div>
                    )}
                    {selectedPlaceId && (
                        <div className="mt-3">
                            {renderTimeSlots}
                        </div>
                    )}
                    {selectedSlot && (
                        <div className="mt-3">
                            {renderDetail}
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default ReservationNew;