import AttendanceManage from '../AttendanceManage/AttendanceManage'; 
import MemberManage from '../MemberManage/MemberManage';
import GroupNotice from '../GroupNotice/GroupNotice';
import DataBackup from '../DataBackup/DataBackup';
import ReservationManage from '../ReservationManage/ReservationManage';
import ParishAttendanceManage from '../ParishAttendanceManage/ParishAttendanceManage';
import { toast } from 'react-toastify';
import { Container, Row, Col, Card, Navbar, Button } from 'react-bootstrap';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ApprovalManage from '../ApprovalManage/ApprovalManage';

function MainLayout({ user, onLogout}) {
    const navigate = useNavigate();
    const location = useLocation();
    
    const baseFeatures = [
      { id: 1, name: '출결 관리', icon: '📝', path: '/attendance' },
      { id: 2, name: '회원 관리', icon: '🧑‍🤝‍🧑', path: '/members' },
      { id: 3, name: '교구 공지사항', icon: '📣', path: '/notice' },
      { id: 4, name: '데이터 백업', icon: '💾', path: '/backup' },
      { id: 6, name: '장소 예약', icon: '🗓️', path: '/reservation' },
    ];
    const features = baseFeatures;

    if (user && (user.role === 0 || user.role === 1)) {
      baseFeatures.push({ 
        id: 7, 
        name: '가입 승인 관리', 
        icon: '✅', 
        path: '/approvals' 
      });
    }

    if (user && (user.role === 1 || user.role === 4)) {
      baseFeatures.push({ 
        id: 5, 
        name: '교구 출결 관리', // 👈 [신규] 새 기능
        icon: '📊', 
        path: '/parish-attendance' 
      });
    }

    const handleLogout = () => {
        const confirmLogout = window.confirm("정말로 로그아웃 하시겠습니까?");
        if (confirmLogout) {
            toast.success("로그아웃되었습니다.");
            onLogout();
        }
    };

    const handleFeatureClick = (path) => {
        navigate(path);
    };

    const handleBack = () => {
        navigate('/'); // 👈 항상 홈으로 이동
    };

    const getCurrentPageTitle = () => {
        const currentPath = location.pathname; // 현재 URL 경로
        if (currentPath === '/') return '앱 이름';
        const feature = features.find(f => f.path === currentPath);
        return feature ? feature.name : '페이지';
    };
    
    // 홈 페이지 그리드 뷰 컴포넌트
    const HomeGrid = () => (
    // 🔑 Container: 전체를 감싸고 적절한 여백을 줌
    <Container>
        {/* 🔑 Row/Col: 반응형 그리드. (모바일 2열, 데스크톱 4열) */}
        <Row className="g-3"> {/* g-3: 아이템 간의 간격 */}
            {features.map((feature) => (
                <Col key={feature.id} xs={6} md={3}>
                    {/* 🔑 Card: Bootstrap의 카드 컴포넌트 */}
                    <Card 
                        className="h-100 text-center shadow-sm" 
                        onClick={() => handleFeatureClick(feature.path)}
                        role="button"
                        style={{ borderRadius: '15px' }} // 🔑 기존 CSS의 둥근 모서리 유지
                    >
                        <Card.Body className="d-flex flex-column justify-content-center">
                            {/* 🔑 텍스트 크기 등은 Bootstrap 클래스로 제어 */}
                            <div className="fs-1 mb-2">{feature.icon}</div>
                            <Card.Title as="h6" className="fw-normal">
                                {feature.name}
                            </Card.Title>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    </Container>
    );
    
    const isHomePage = location.pathname === '/';

    return (
    <div className="app-container">
      
      {/* [사용자 변경] 'bg-primary' 클래스 추가
          [Gemini 추가] 'variant="dark"' 추가 -> bg-primary 위에 흰색 글씨/아이콘이 나오도록 함 
      */}
      <Navbar className="shadow-sm mb-3 bg-primary" variant="dark" style={{ minHeight: '70px' }}>
        <Container fluid className="align-items-center position-relative"> 

            {/* 1. 왼쪽 (뒤로가기 또는 로고) */}
            {!isHomePage ? (
                <Button variant="link" onClick={handleBack} className="text-decoration-none text-white fw-bold p-0 fs-5 ">
                    <span className="fs-4 me-1">←</span> 메인으로
                </Button>
            ) : (
                <Navbar.Brand href="#home" onClick={() => navigate('/')}>
                    <img
                      src="/logo.png"
                      height="45"
                      className="d-inline-block align-middle" 
                      alt="앱 로고"
                      style={{ position: 'relative', top: '-1px' }}
                    />
                </Navbar.Brand>
            )}

            {/* 2. 중앙 (페이지 제목) */}
            <Navbar.Text className="fw-bold fs-5 d-none d-md-block position-absolute top-50 start-50 translate-middle">
                {getCurrentPageTitle()}
            </Navbar.Text>

            {/* 3. 오른쪽 (사용자 정보 및 로그아웃) */}
            <Navbar.Collapse className="justify-content-end ">
                
                {/* [요청 2] 굵고, 크게, (흰색으로)
                    'fw-bold' (굵게), 'fs-5' (크게) 추가. 
                    흰색 글씨는 Navbar의 'variant="dark"'가 처리해줍니다.
                */}
                <span className="me-2 fw-bold fs-5 text-white">
                    {user.name}님
                </span>

                {/* [사용자 변경] 'variant="primary"'를 'variant="secondary"'로 변경 */}
                <Button className="btn btn-secondary" onClick={handleLogout}>
                    로그아웃
                </Button>
            </Navbar.Collapse>

            <Navbar.Toggle aria-controls="main-navbar-nav" className="d-md-none" /> 

        </Container>
      </Navbar>
          
      <main className="main-content">
            <Routes>
                <Route path="/" element={<HomeGrid />} />
                <Route path="/attendance/*" element={<AttendanceManage />} />
                <Route path="/members" element={<MemberManage />} />
                <Route path="/notice" element={<GroupNotice />} />
                <Route path="/backup" element={<DataBackup />} />
                <Route path="/parish-attendance" element={<ParishAttendanceManage user={user} />} />
                <Route path="/reservation/*" element={<ReservationManage />} />
                <Route path="/approvals" element={<ApprovalManage />} />
            </Routes>
      </main>
    </div>
  );
}

export default MainLayout;