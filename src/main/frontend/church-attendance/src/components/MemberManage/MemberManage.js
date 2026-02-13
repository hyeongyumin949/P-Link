import React, { useState, useMemo } from 'react'; 
import { useMemberContext } from '../../MemberContext'; 
import MemberFormModal from './MemberFormModal';
import MemberDeleteModal from './MemberDeleteModal'; 
import { Container, Button, ListGroup, Badge, Row, Col } from 'react-bootstrap';

function MemberManage() {
  // 🔑 [수정] useMemberContext에서 로그인 사용자 정보(user)를 추가로 가져옵니다.
  const { members, /*addMember, updateMember*/ user } = useMemberContext(); 
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false); // 등록/수정 모달
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // 삭제 모달
  const [selectedMember, setSelectedMember] = useState(null); 
  
  // 🔑 [수정] 로그인된 사용자의 groupName을 사용합니다.
  // user 객체가 null이 아닐 때만 groupName을 사용하고, 그렇지 않으면 기본값 ("그룹 없음")을 사용합니다.
  const currentGroupName = user ? user.groupName : "그룹 없음"; 
  
  // Hooks: 활성 회원 목록만 필터링
  // 🔑 [확인] useMemo의 의존성 배열(dependency array)에 currentGroupName이 이미 잘 포함되어 있습니다.
  const activeMembers = useMemo(() => {
      // 🔑 [수정] m.groupName과 currentGroupName 모두 .trim()을 적용합니다.
      // 1. null이나 undefined가 아닐 때만 .trim()을 하도록 안전장치(?.)를 추가합니다.
      // 2. m.active도 다시 한번 확인합니다.
      return members.filter(m => 
        m.active && 
        m.groupName?.trim() === currentGroupName?.trim()
      );
  }, [members, currentGroupName]);

  // 회원 등록/수정 모달 핸들러
  const handleOpenFormModal = (member = null) => {
      // 🔑 [추가] 로그인 상태가 아닐 경우 접근을 막는 안전장치
     if (!user) {
         alert("로그인 후 이용 가능합니다.");
         return;
     }
      setSelectedMember(member);
      setIsFormModalOpen(true);
  };
  const handleCloseFormModal = () => {
      setIsFormModalOpen(false);
      setSelectedMember(null);
  };
  
  // 회원 삭제 모달 핸들러
  const handleOpenDeleteModal = () => {
      // 🔑 [추가] 로그인 상태가 아닐 경우 접근을 막는 안전장치
     if (!user) {
         alert("로그인 후 이용 가능합니다.");
         return;
     }
      setIsDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
      setIsDeleteModalOpen(false);
  };

  // ----------------------------------------------------
  // 회원 목록 리스트 아이템 컴포넌트 (변경 없음)
  // ----------------------------------------------------
  const MemberListItem = ({ member }) => {
    const handleClick = () => {
        handleOpenFormModal(member);
    };

    return (
      <ListGroup.Item 
          action 
          onClick={handleClick}
          /* [수정] py-3 추가 (세로 길이) */
          className="d-flex justify-content-between align-items-center py-3"
      >
        {/* [수정] fs-5 추가 (이름 크기) */}
        <div className="fw-bold fs-5">{member.name}</div>
        
        {/* [수정] small -> fs-6 (연락처 크기) */ }
        <span className="text-muted fs-6"> 
            {member.contact || '연락처 없음'}
        </span>
      </ListGroup.Item>
    );
  };

  return (
    <Container className="py-3">
      
      {/* 1. 소속 이름 및 총 인원수 (맨 위) */}
      {/* [수정] 
        - d-flex justify-content-center로 감싸서 중앙 정렬
        - col-10 col-md-8로 감싸서 '가로 폭'을 리스트와 동일하게 맞춤
      */}
      <div className="d-flex justify-content-center">
        <div className="col-10 col-md-8">
          <div className="d-flex align-items-baseline mb-2">
            <h4 className="mb-0">
                소속: <span className="text-primary fw-bold"> {currentGroupName}</span>
            </h4>
            <Badge bg="secondary" pill className="ms-2">
                총 {activeMembers.length}명
            </Badge>
          </div>
        </div>
      </div>

      {/* 2. 회원 목록 리스트 (중간) */}
      {/* (이 부분은 이미 col-10 col-md-8로 중앙 정렬되어 있음) */}
      <div className="d-flex justify-content-center">
        <div className="col-10 col-md-8">
          <ListGroup> 
            {activeMembers.map(member => (
              <MemberListItem key={member.id} member={member} />
            ))}
          </ListGroup>
        </div>
      </div>
      
      {/* 3. 상단 액션 버튼 영역 (맨 아래) */}
      {/* (이 부분도 col-10 col-md-8로 중앙 정렬되어 있음) */}
      <div className="pb-3 mt-4 d-flex justify-content-center">
        <div className="col-10 col-md-8">
          <Row g="2">
            <Col>
              <div className="d-grid"> 
                <Button 
                  variant="primary" 
                  onClick={() => handleOpenFormModal(null)}
                  size="lg"
                >
                  추가하기
                </Button>
              </div>
            </Col>
            <Col>
              <div className="d-grid">
                <Button 
                  variant="danger" 
                  onClick={handleOpenDeleteModal}
                  size="lg"
                >
                  삭제하기
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
      
      {/* 등록/수정 모달 (이하 생략) ... */}
      <MemberFormModal 
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        memberData={selectedMember}
        currentGroupName={currentGroupName} 
      />
      <MemberDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          currentGroupName={currentGroupName}
      />
    </Container>
  );
}
export default MemberManage;