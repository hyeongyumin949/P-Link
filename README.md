# P-Link

**P-Link**
 - Presence + Link 교회와 출결을 연결하다.

자동화되는 이 시대, 교회도 바뀔 때가 됐다!
연령대 상관없이 누구나 사용하는 모바일 웹앱!
항상 장소 예약을 위해 카톡 기다리지 말고 예약으로!
효율적인 회원 관리, 실시간 데이터 반영, 직분마다 구별된 기능까지!
교회 출결 관리를 효율적으로 관리하고 싶다면 P-Link!

---

## 주요 기능

### 회원 시스템

- 이메일 기반 회원가입 및 로그인
- 세션 만료 및 자동 로그아웃 처리
- 프로필 편집 (닉네임, 소개, 프로필 이미지)

### 회원 관리 시스템

- 회원 등록 및 관리
- 출결 내역 정리
- 상위 rank 유저에게 보고
- 공지사항 등록 및 회원 공유

### 장소 예약 시스템

- 실시간 장소 예약 및 조회

---

## 사용자 플로우

### 교역자 (1순위 role)

1. 로그인
2. 교구장, 속장, 예비속장 출결 완료 후 데이터 확인 가능
3. 공지사항 및 코멘트
4. 장소 예약

### 교구장 - 속장 (2-3순위 role)

1. 로그인
2. 메인 대시보드 진입
3. 교구 및 속 회원 관리
  - 출석 관리
  - 공지사항 작성
4. 업로드 후 데이터 전송
5. 장소 예약

---

## 데이터 모델 개요 (ERD 요약)

1. user --> (church_group) member 관리
2. user --> (member) attendacne, notice 관리
3. user --> notice_comment
4. user --> reservation --> place, booking

---

## 기술 스택

### Frontend

- **React**
- **CSS3 / Bootstrap**

### Backend

- **Java**
- **Spring Boot**
- Spring MVC / Spring Data JPA / Spring Security

### Database

- **MySQL**
