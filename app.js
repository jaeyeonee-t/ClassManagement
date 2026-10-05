/* ==========================================================================
   Classroom Management & Economy Gamification Application Logic (app.js)
   ========================================================================== */

// 25명의 샘플 학생 데이터
const INITIAL_STUDENT_NAMES = [
  "김민준", "이서연", "박지후", "최수아", "정도윤",
  "강하은", "조시우", "윤지유", "장현우", "임아린",
  "한지호", "오채원", "서준혁", "신예은", "권태양",
  "황유진", "안승현", "송다은", "류민재", "홍지안",
  "전우진", "고서현", "문하준", "손지민", "양현서"
];

// 25개의 1인 1역 역할 목록
const DEFAULT_ROLES = [
  { id: 1, name: "칠판 도우미", desc: "쉬는 시간마다 칠판을 깔끔히 닦기" },
  { id: 2, name: "급식 도우미", desc: "급식 식판 및 잔반 정리 돕기" },
  { id: 3, name: "우유 도우미", desc: "아침 우유 수령 및 상자 정리" },
  { id: 4, name: "에너지 절약관", desc: "이동 수업 시 전등 끄기 및 창문 닫기" },
  { id: 5, name: "도서 관리원", desc: "학급 문고 정돈 및 대출 관리" },
  { id: 6, name: "체육 부장", desc: "체육 시간 기구 준비 및 줄 세우기" },
  { id: 7, name: "방송 도우미", desc: "아침 방송 점검 및 볼륨 조절" },
  { id: 8, name: "식물 관찰관", desc: "학급 화분에 주기적으로 물 주기" },
  { id: 9, name: "우편 배달원", desc: "가정통신문 및 프린트물 전달" },
  { id: 10, name: "컴퓨터 관리원", desc: "수업용 컴퓨터 및 프로젝터 켜기" },
  { id: 11, name: "분리수거 반장", desc: "학급 재활용 쓰레기통 관리" },
  { id: 12, name: "보드게임지기", desc: "쉬는 시간 보드게임 정리 상태 점검" },
  { id: 13, name: "환기 도우미", desc: "매 시간마다 5분간 창문 열어 환기" },
  { id: 14, name: "출석 점검원", desc: "아침 자습 시간 출석 상태 확인" },
  { id: 15, name: "알림장 작성원", desc: "칠판 구석에 오늘의 알림장 적기" },
  { id: 16, name: "방역 도우미", desc: "책상 소독 소모품 챙기기" },
  { id: 17, name: "학습지 수거원", desc: "수업 후 학습지 한데 모아 제출" },
  { id: 18, name: "청소 도우미 A", desc: "교실 중앙 바닥 쓸기" },
  { id: 19, name: "청소 도우미 B", desc: "교실 뒤편 정리함 쓰레기 비우기" },
  { id: 20, name: "게시판 관리원", desc: "학급 게시물 수평 맞춰 붙이기" },
  { id: 21, name: "시간 지킴이", desc: "수업 시작 1분 전 종소리 알림" },
  { id: 22, name: "칭찬 요정", desc: "친구들의 긍정적인 행동 1가지 찾기" },
  { id: 23, name: "열쇠 지킴이", desc: "교실 문 잠금 상태 최종 점검" },
  { id: 24, name: "비품 관리원", desc: "분필, 지우개, 마카 잔여물 확인" },
  { id: 25, name: "행복 DJ", desc: "점심시간 신청 음악 1곡 재생" }
];

// 초기 학급 미션 목록
const DEFAULT_MISSIONS = [
  { id: 1, title: "학급 회의 아이디어 1개 이상 의견 내기", reward: 30, completedStudents: [1, 3] },
  { id: 2, title: "수업 태도 우수 모둠 선정 완료", reward: 50, completedStudents: [2, 5, 6] },
  { id: 3, title: "교실 쓰레기 3개 줍기 미션", reward: 20, completedStudents: [] }
];

// 초기 상점 상품 목록
const DEFAULT_SHOP_ITEMS = [
  { id: 1, name: "원하는 자리 1일 지정권", emoji: "🪑", price: 200, desc: "하루 동안 내가 원하는 자리로 자유 이동하여 앉기", stock: 5 },
  { id: 2, name: "청소 면제권 (1회)", emoji: "🧹", price: 350, desc: "오늘 내 1인 1역 청소 의무를 1회 면제받기", stock: 3 },
  { id: 3, name: "급식 1등 줄서기 쿠폰", emoji: "🍱", price: 150, desc: "점심시간 급식 줄을 맨 앞으로 서서 받기", stock: 10 },
  { id: 4, name: "보드게임 자유 이용권", emoji: "🎲", price: 100, desc: "쉬는 시간 선호하는 보드게임 1순위 선택", stock: 8 },
  { id: 5, name: "선생님과 1:1 상담권", emoji: "💬", price: 50, desc: "간식과 함께 선생님과 고민 상담 15분", stock: 99 }
];

// ================= STATE MANAGEMENT =================

let appState = {
  students: [],
  roles: DEFAULT_ROLES,
  missions: DEFAULT_MISSIONS,
  shopItems: DEFAULT_SHOP_ITEMS,
  orders: [],
  currentMode: 'teacher', // 'teacher' | 'student'
  currentStudentId: 1,
  selectedStudentIds: new Set(),
  currencyType: 'plus', // 'plus' | 'minus'
  teacherTab: 'students',
  studentTab: 'tasks'
};

// ================= INITIALIZATION & STORAGE =================

document.addEventListener('DOMContentLoaded', () => {
  loadStateFromLocalStorage();
  setupEventListeners();
  renderAll();
});

function loadStateFromLocalStorage() {
  const savedData = localStorage.getItem('class_management_state_v1');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      appState.students = parsed.students || [];
      appState.roles = parsed.roles || DEFAULT_ROLES;
      appState.missions = parsed.missions || DEFAULT_MISSIONS;
      appState.shopItems = parsed.shopItems || DEFAULT_SHOP_ITEMS;
      appState.orders = parsed.orders || [];
      appState.currentStudentId = parsed.currentStudentId || 1;
    } catch (e) {
      console.error("Failed to parse local storage data, resetting.", e);
      initializeSampleStudents();
    }
  } else {
    initializeSampleStudents();
  }
}

function initializeSampleStudents() {
  const sampleAvatars = ["👦", "👧", "🧑", "🧒", "🎒", "⚽", "🎨", "🎧"];
  appState.students = INITIAL_STUDENT_NAMES.map((name, index) => {
    const studentId = index + 1;
    const initialXP = Math.floor(Math.random() * 150) + 50; // Initial random XP (50~200)
    const roleObj = DEFAULT_ROLES[index % DEFAULT_ROLES.length];
    
    return {
      id: studentId,
      name: name,
      avatar: sampleAvatars[index % sampleAvatars.length],
      balance: Math.floor(initialXP * 1.2),
      totalXP: initialXP,
      roleId: roleObj.id,
      roleName: roleObj.name,
      isRoleCompletedToday: Math.random() > 0.6,
      history: [
        { date: getTodayString(), type: 'plus', amount: initialXP, reason: '학급 경제교실 기초 화폐 지급' }
      ]
    };
  });

  appState.missions = DEFAULT_MISSIONS;
  appState.shopItems = DEFAULT_SHOP_ITEMS;
  appState.orders = [
    {
      id: 101,
      studentId: 1,
      studentName: "김민준",
      itemId: 3,
      itemName: "급식 1등 줄서기 쿠폰",
      itemEmoji: "🍱",
      price: 150,
      status: 'pending',
      date: getTodayString()
    }
  ];

  saveStateToLocalStorage();
}

function saveStateToLocalStorage() {
  const dataToSave = {
    students: appState.students,
    roles: appState.roles,
    missions: appState.missions,
    shopItems: appState.shopItems,
    orders: appState.orders,
    currentStudentId: appState.currentStudentId
  };
  localStorage.setItem('class_management_state_v1', JSON.stringify(dataToSave));
}

function resetToSampleData() {
  if (confirm("정말로 모든 데이터를 샘플 데이터로 초기화하시겠습니까? (수정 내역이 리셋됩니다)")) {
    localStorage.removeItem('class_management_state_v1');
    initializeSampleStudents();
    appState.selectedStudentIds.clear();
    renderAll();
    showToast("모든 학급 데이터가 기본값으로 초기화되었습니다.", "info");
  }
}

// ================= LEVEL & XP UTILS =================

function calculateLevelInfo(totalXP) {
  const level = Math.floor(totalXP / 100) + 1;
  const currentXP = totalXP % 100;
  return {
    level: level,
    currentXP: currentXP,
    nextLevelXP: 100,
    progressPercent: currentXP
  };
}

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ================= RENDER CONTROL =================

function renderAll() {
  updateHeaderModeBadge();
  if (appState.currentMode === 'teacher') {
    document.getElementById('view-teacher').classList.add('active');
    document.getElementById('view-student').classList.remove('active');
    renderTeacherView();
  } else {
    document.getElementById('view-teacher').classList.remove('active');
    document.getElementById('view-student').classList.add('active');
    renderStudentView();
  }
}

function switchMode(mode) {
  appState.currentMode = mode;
  document.getElementById('btn-mode-teacher').classList.toggle('active', mode === 'teacher');
  document.getElementById('btn-mode-student').classList.toggle('active', mode === 'student');
  renderAll();
}

function updateHeaderModeBadge() {
  const badge = document.getElementById('active-profile-badge');
  const nameSpan = document.getElementById('current-user-name');

  if (appState.currentMode === 'teacher') {
    badge.className = 'active-profile-badge teacher-badge';
    badge.innerHTML = `<i class="fa-solid fa-shield-halved"></i> <span>담임교사 모드</span>`;
  } else {
    const student = appState.students.find(s => s.id === appState.currentStudentId);
    badge.className = 'active-profile-badge student-badge';
    badge.innerHTML = `<i class="fa-solid fa-user-graduate"></i> <span>${student ? student.name : '학생'} 모드</span>`;
  }
}

function openStudentPickerModal() {
  renderStudentPickerGrid();
  openModal('modal-student-picker');
}

function renderStudentPickerGrid() {
  const grid = document.getElementById('student-picker-grid');
  grid.innerHTML = appState.students.map(student => `
    <button class="student-picker-btn ${student.id === appState.currentStudentId ? 'active' : ''}" onclick="selectStudent(${student.id})">
      <span class="avatar">${student.avatar}</span>
      <span class="name">${student.name}</span>
    </button>
  `).join('');
}

function selectStudent(studentId) {
  appState.currentStudentId = studentId;
  closeModal('modal-student-picker');
  switchMode('student');
  showToast(`${appState.students.find(s => s.id === studentId).name} 학생 화면으로 전환되었습니다.`, "info");
}

// ================= TEACHER VIEW RENDERING =================

function switchTeacherTab(tabName) {
  appState.teacherTab = tabName;
  const tabs = document.querySelectorAll('#view-teacher .tab-btn');
  tabs.forEach((tab, index) => {
    const tabTarget = ['students', 'roles', 'shop'][index];
    tab.classList.toggle('active', tabTarget === tabName);
  });

  document.getElementById('teacher-tab-students').classList.toggle('active', tabName === 'students');
  document.getElementById('teacher-tab-roles').classList.toggle('active', tabName === 'roles');
  document.getElementById('teacher-tab-shop').classList.toggle('active', tabName === 'shop');

  renderTeacherView();
}

function renderTeacherView() {
  // Update Top Stats
  document.getElementById('stat-total-students').textContent = `${appState.students.length}명`;
  
  const todayStr = getTodayString();
  let todayTotalCurrency = 0;
  appState.students.forEach(s => {
    s.history.forEach(h => {
      if (h.date === todayStr && h.type === 'plus') {
        todayTotalCurrency += h.amount;
      }
    });
  });
  document.getElementById('stat-today-currency').textContent = `+${todayTotalCurrency} Gold`;

  const pendingOrdersCount = appState.orders.filter(o => o.status === 'pending').length;
  document.getElementById('stat-pending-orders').textContent = `${pendingOrdersCount}건`;
  
  const shopBadge = document.getElementById('shop-badge-count');
  if (pendingOrdersCount > 0) {
    shopBadge.textContent = pendingOrdersCount;
    shopBadge.classList.remove('hidden');
  } else {
    shopBadge.classList.add('hidden');
  }

  const completedRolesCount = appState.students.filter(s => s.isRoleCompletedToday).length;
  const completionRate = Math.round((completedRolesCount / appState.students.length) * 100);
  document.getElementById('stat-mission-rate').textContent = `${completionRate}%`;

  // Render current tab content
  if (appState.teacherTab === 'students') {
    renderStudentList();
  } else if (appState.teacherTab === 'roles') {
    renderRolesAndMissions();
  } else if (appState.teacherTab === 'shop') {
    renderTeacherShopAndApprovals();
  }
}

function renderStudentList() {
  const container = document.getElementById('student-cards-grid');
  const searchKeyword = (document.getElementById('student-search-input').value || "").trim().toLowerCase();

  const filtered = appState.students.filter(s => s.name.toLowerCase().includes(searchKeyword));

  document.getElementById('selected-student-count').textContent = appState.selectedStudentIds.size;
  
  const btnSelectAllText = document.getElementById('btn-select-all-text');
  if (appState.selectedStudentIds.size === appState.students.length && appState.students.length > 0) {
    btnSelectAllText.textContent = '선택 해제';
  } else {
    btnSelectAllText.textContent = '전체 선택';
  }

  container.innerHTML = filtered.map(student => {
    const isSelected = appState.selectedStudentIds.has(student.id);
    const levelInfo = calculateLevelInfo(student.totalXP);
    
    return `
      <div class="student-card ${isSelected ? 'selected' : ''}" onclick="toggleStudentSelection(${student.id})">
        <div class="card-top">
          <div class="student-avatar">${student.avatar}</div>
          <div class="card-checkbox">
            ${isSelected ? '<i class="fa-solid fa-check"></i>' : ''}
          </div>
        </div>
        <div>
          <div class="student-name">${student.name}</div>
          <div class="student-role-tag"><i class="fa-solid fa-user-tag"></i> ${student.roleName || '역할 없음'}</div>
        </div>
        <div class="card-stats">
          <span class="card-gold">💰 ${student.balance} <small>Gold</small></span>
          <span class="card-level">Lv.${levelInfo.level} (${levelInfo.currentXP}XP)</span>
        </div>
      </div>
    `;
  }).join('');
}

function toggleStudentSelection(studentId) {
  if (appState.selectedStudentIds.has(studentId)) {
    appState.selectedStudentIds.delete(studentId);
  } else {
    appState.selectedStudentIds.add(studentId);
  }
  renderStudentList();
}

function toggleSelectAllStudents() {
  if (appState.selectedStudentIds.size === appState.students.length) {
    appState.selectedStudentIds.clear();
  } else {
    appState.students.forEach(s => appState.selectedStudentIds.add(s.id));
  }
  renderStudentList();
}

function renderRolesAndMissions() {
  // 1인 1역 Table Body
  const tbody = document.getElementById('role-assignment-tbody');
  tbody.innerHTML = appState.students.map(student => `
    <tr>
      <td><strong>${student.avatar} ${student.name}</strong></td>
      <td>
        <select class="role-select" onchange="assignRoleToStudent(${student.id}, this.value)">
          ${appState.roles.map(r => `
            <option value="${r.id}" ${r.id === student.roleId ? 'selected' : ''}>${r.name}</option>
          `).join('')}
        </select>
      </td>
      <td>
        <span class="status-badge ${student.isRoleCompletedToday ? 'status-done' : 'status-pending'}">
          ${student.isRoleCompletedToday ? '완수함 (+20G)' : '미수행'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="toggleStudentRoleStatus(${student.id})">
          ${student.isRoleCompletedToday ? '완수 취소' : '수행 완료'}
        </button>
      </td>
    </tr>
  `).join('');

  // Teacher Missions List
  const missionContainer = document.getElementById('teacher-mission-list');
  missionContainer.innerHTML = appState.missions.map(m => `
    <div class="mission-item">
      <div class="mission-info">
        <h4>${m.title}</h4>
        <span class="mission-reward-tag">보상: +${m.reward} Gold & XP | 완료: ${m.completedStudents.length}명</span>
      </div>
      <button class="btn btn-sm btn-outline" onclick="deleteMission(${m.id})">
        <i class="fa-solid fa-trash"></i> 삭제
      </button>
    </div>
  `).join('');
}

function assignRoleToStudent(studentId, roleId) {
  const student = appState.students.find(s => s.id === studentId);
  const role = appState.roles.find(r => r.id === parseInt(roleId));
  if (student && role) {
    student.roleId = role.id;
    student.roleName = role.name;
    saveStateToLocalStorage();
    showToast(`${student.name} 학생의 역할이 [${role.name}] (으)로 변경되었습니다.`, "success");
  }
}

function toggleStudentRoleStatus(studentId) {
  const student = appState.students.find(s => s.id === studentId);
  if (student) {
    student.isRoleCompletedToday = !student.isRoleCompletedToday;
    if (student.isRoleCompletedToday) {
      student.balance += 20;
      student.totalXP += 20;
      student.history.unshift({
        date: getTodayString(),
        type: 'plus',
        amount: 20,
        reason: `[1인 1역] ${student.roleName} 일일 완수 보상`
      });
      showToast(`${student.name} 학생이 1인 1역 보상 20 Gold를 획득했습니다!`, "success");
    }
    saveStateToLocalStorage();
    renderTeacherView();
  }
}

function autoAssignRoles() {
  const shuffledRoles = [...appState.roles].sort(() => Math.random() - 0.5);
  appState.students.forEach((student, idx) => {
    const role = shuffledRoles[idx % shuffledRoles.length];
    student.roleId = role.id;
    student.roleName = role.name;
  });
  saveStateToLocalStorage();
  renderTeacherView();
  showToast("25명 학생에게 1인 1역이 무작위로 재배정되었습니다.", "info");
}

function renderTeacherShopAndApprovals() {
  // Approval Orders
  const approvalContainer = document.getElementById('approval-orders-list');
  const pendingOrders = appState.orders.filter(o => o.status === 'pending');

  if (pendingOrders.length === 0) {
    approvalContainer.innerHTML = `<p class="modal-desc" style="text-align:center; padding: 20px;">대기 중인 구매 승인건이 없습니다 🎉</p>`;
  } else {
    approvalContainer.innerHTML = pendingOrders.map(order => `
      <div class="approval-card">
        <div>
          <span class="approval-user">${order.studentName}</span> 학생
          <div class="approval-item-name">${order.itemEmoji} ${order.itemName} (${order.price} Gold)</div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-sm btn-primary" onclick="approveOrder(${order.id})">
            <i class="fa-solid fa-check"></i> 승인
          </button>
          <button class="btn btn-sm btn-secondary" onclick="rejectOrder(${order.id})">
            <i class="fa-solid fa-xmark"></i> 거절(환불)
          </button>
        </div>
      </div>
    `).join('');
  }

  // Shop Item Manage Grid
  const shopManageGrid = document.getElementById('teacher-shop-item-list');
  shopManageGrid.innerHTML = appState.shopItems.map(item => `
    <div class="shop-manage-card">
      <div class="shop-card-emoji">${item.emoji}</div>
      <div class="shop-card-title">${item.name}</div>
      <div class="shop-card-price">💰 ${item.price} Gold</div>
      <div style="margin-top: 10px;">
        <button class="btn btn-sm btn-outline" onclick="deleteShopItem(${item.id})">
          <i class="fa-solid fa-trash"></i> 삭제
        </button>
      </div>
    </div>
  `).join('');
}

function approveOrder(orderId) {
  const order = appState.orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'approved';
    saveStateToLocalStorage();
    renderTeacherView();
    showToast(`${order.studentName} 학생의 [${order.itemName}] 구매가 승인되었습니다.`, "success");
  }
}

function rejectOrder(orderId) {
  const order = appState.orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'rejected';
    // 환불 처리
    const student = appState.students.find(s => s.id === order.studentId);
    if (student) {
      student.balance += order.price;
      student.history.unshift({
        date: getTodayString(),
        type: 'plus',
        amount: order.price,
        reason: `[환불] ${order.itemName} 구매 거절 환불`
      });
    }
    saveStateToLocalStorage();
    renderTeacherView();
    showToast(`${order.studentName} 학생의 주문이 거절되어 ${order.price} Gold가 환불되었습니다.`, "warning");
  }
}

// ================= STUDENT VIEW RENDERING =================

function switchStudentTab(tabName) {
  appState.studentTab = tabName;
  const tabs = document.querySelectorAll('#view-student .tab-menu .tab-btn');
  tabs.forEach((tab, index) => {
    const tabTarget = ['tasks', 'shop', 'inventory'][index];
    tab.classList.toggle('active', tabTarget === tabName);
  });

  document.getElementById('student-tab-tasks').classList.toggle('active', tabName === 'tasks');
  document.getElementById('student-tab-shop').classList.toggle('active', tabName === 'shop');
  document.getElementById('student-tab-inventory').classList.toggle('active', tabName === 'inventory');

  renderStudentView();
}

function renderStudentView() {
  const currentStudent = appState.students.find(s => s.id === appState.currentStudentId) || appState.students[0];
  const levelInfo = calculateLevelInfo(currentStudent.totalXP);

  // Hero Section
  document.getElementById('student-hero-avatar').textContent = currentStudent.avatar;
  document.getElementById('student-hero-name').textContent = currentStudent.name;
  document.getElementById('student-hero-role').innerHTML = `<i class="fa-solid fa-user-gear"></i> ${currentStudent.roleName || '역할 미배정'}`;
  document.getElementById('student-hero-balance').innerHTML = `${currentStudent.balance} <small>Gold</small>`;
  document.getElementById('student-hero-level').textContent = `Lv.${levelInfo.level}`;
  document.getElementById('student-hero-xp-text').textContent = `${levelInfo.currentXP} / 100 XP`;
  document.getElementById('student-hero-xp-fill').style.width = `${levelInfo.progressPercent}%`;

  // Student Tab Contents
  if (appState.studentTab === 'tasks') {
    renderStudentTasks(currentStudent);
  } else if (appState.studentTab === 'shop') {
    renderStudentShop(currentStudent);
  } else if (appState.studentTab === 'inventory') {
    renderStudentInventory(currentStudent);
  }
}

function renderStudentTasks(student) {
  // 1인 1역 Card
  const roleBox = document.getElementById('student-role-task-box');
  const roleObj = appState.roles.find(r => r.id === student.roleId);

  roleBox.innerHTML = `
    <div class="task-info">
      <h4><i class="fa-solid fa-clipboard-check icon-accent"></i> ${student.roleName || '1인 1역'}</h4>
      <p>${roleObj ? roleObj.desc : '오늘의 역할을 꼼꼼히 완수해주세요!'}</p>
    </div>
    <button class="check-button ${student.isRoleCompletedToday ? 'completed' : ''}" onclick="studentToggleRoleComplete(${student.id})">
      <i class="fa-solid ${student.isRoleCompletedToday ? 'fa-circle-check' : 'fa-circle'}"></i>
      ${student.isRoleCompletedToday ? '수행 완료 (+20G)' : '오늘 수행 체크'}
    </button>
  `;

  // Student Missions
  const missionContainer = document.getElementById('student-mission-list');
  missionContainer.innerHTML = appState.missions.map(m => {
    const isDone = m.completedStudents.includes(student.id);
    return `
      <div class="student-mission-card">
        <div>
          <h4 style="color:#fff; font-size:0.95rem; font-weight:700;">${m.title}</h4>
          <span style="color:var(--accent-gold); font-size:0.8rem; font-weight:700;">보상: +${m.reward} Gold & XP</span>
        </div>
        <button class="check-button ${isDone ? 'completed' : ''}" onclick="studentToggleMission(${m.id})">
          <i class="fa-solid ${isDone ? 'fa-circle-check' : 'fa-circle'}"></i>
          ${isDone ? '완료됨' : '미션 완료'}
        </button>
      </div>
    `;
  }).join('');
}

function studentToggleRoleComplete(studentId) {
  const student = appState.students.find(s => s.id === studentId);
  if (student) {
    student.isRoleCompletedToday = !student.isRoleCompletedToday;
    if (student.isRoleCompletedToday) {
      student.balance += 20;
      student.totalXP += 20;
      student.history.unshift({
        date: getTodayString(),
        type: 'plus',
        amount: 20,
        reason: `[1인 1역] ${student.roleName} 완수 보상`
      });
      showToast("1인 1역 수행 완료! +20 Gold & XP를 획득했습니다! 🎉", "success");
    }
    saveStateToLocalStorage();
    renderStudentView();
  }
}

function studentToggleMission(missionId) {
  const mission = appState.missions.find(m => m.id === missionId);
  const student = appState.students.find(s => s.id === appState.currentStudentId);

  if (mission && student) {
    const doneIndex = mission.completedStudents.indexOf(student.id);
    if (doneIndex > -1) {
      mission.completedStudents.splice(doneIndex, 1);
    } else {
      mission.completedStudents.push(student.id);
      student.balance += mission.reward;
      student.totalXP += mission.reward;
      student.history.unshift({
        date: getTodayString(),
        type: 'plus',
        amount: mission.reward,
        reason: `[미션 완료] ${mission.title}`
      });
      showToast(`미션 완료! +${mission.reward} Gold & XP를 획득했습니다! ⭐`, "success");
    }
    saveStateToLocalStorage();
    renderStudentView();
  }
}

function renderStudentShop(student) {
  const shopGrid = document.getElementById('student-shop-grid');
  shopGrid.innerHTML = appState.shopItems.map(item => `
    <div class="shop-item-card">
      <div class="item-emoji">${item.emoji}</div>
      <div class="item-name">${item.name}</div>
      <div class="item-desc">${item.desc}</div>
      <div class="item-price">💰 ${item.price} Gold</div>
      <button class="btn btn-primary btn-sm" onclick="buyShopItem(${item.id})" ${student.balance < item.price ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
        <i class="fa-solid fa-cart-shopping"></i> 구매 신청
      </button>
    </div>
  `).join('');
}

function buyShopItem(itemId) {
  const item = appState.shopItems.find(i => i.id === itemId);
  const student = appState.students.find(s => s.id === appState.currentStudentId);

  if (!item || !student) return;

  if (student.balance < item.price) {
    showToast("잔액이 부족하여 구매할 수 없습니다.", "warning");
    return;
  }

  // 잔액 즉시 차감
  student.balance -= item.price;
  student.history.unshift({
    date: getTodayString(),
    type: 'minus',
    amount: item.price,
    reason: `[상점 구매 신청] ${item.name}`
  });

  // 주문 신청 생성 (pending)
  const newOrder = {
    id: Date.now(),
    studentId: student.id,
    studentName: student.name,
    itemId: item.id,
    itemName: item.name,
    itemEmoji: item.emoji,
    price: item.price,
    status: 'pending',
    date: getTodayString()
  };
  appState.orders.unshift(newOrder);

  saveStateToLocalStorage();
  renderStudentView();
  showToast(`[${item.name}] 구매 신청이 완료되었습니다! 교사 승인 후 사용 가능합니다.`, "success");
}

function renderStudentInventory(student) {
  // Coupons List
  const inventoryContainer = document.getElementById('student-inventory-list');
  const myOrders = appState.orders.filter(o => o.studentId === student.id);

  if (myOrders.length === 0) {
    inventoryContainer.innerHTML = `<p class="modal-desc" style="text-align:center; padding:20px;">보유한 쿠폰이 없습니다.</p>`;
  } else {
    inventoryContainer.innerHTML = myOrders.map(order => {
      let statusBadge = '';
      if (order.status === 'pending') {
        statusBadge = `<span class="status-badge status-pending">승인 대기중</span>`;
      } else if (order.status === 'approved') {
        statusBadge = `<span class="status-badge status-done">사용 가능</span>`;
      } else {
        statusBadge = `<span class="status-badge" style="background:rgba(244,63,94,0.2); color:#f43f5e;">거절(환불됨)</span>`;
      }

      return `
        <div class="coupon-card">
          <div>
            <span class="coupon-name">${order.itemEmoji} ${order.itemName}</span>
            <div style="font-size:0.75rem; color:var(--text-muted);">${order.date}</div>
          </div>
          <div>${statusBadge}</div>
        </div>
      `;
    }).join('');
  }

  // History List
  const historyContainer = document.getElementById('student-history-list');
  historyContainer.innerHTML = student.history.map(h => `
    <div class="history-item">
      <div>
        <div style="color:#fff; font-weight:700;">${h.reason}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${h.date}</div>
      </div>
      <span class="${h.type === 'plus' ? 'history-amount-plus' : 'history-amount-minus'}">
        ${h.type === 'plus' ? '+' : '-'}${h.amount} Gold
      </span>
    </div>
  `).join('');
}

// ================= MODAL & FORM HANDLERS =================

function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function openBulkCurrencyModal() {
  if (appState.selectedStudentIds.size === 0) {
    showToast("화폐를 지급할 학생을 최소 1명 이상 선택해 주세요.", "warning");
    return;
  }
  document.getElementById('currency-modal-target-desc').textContent = 
    `선택한 학생 총 ${appState.selectedStudentIds.size}명에게 화폐를 지급하거나 차감합니다.`;
  
  openModal('modal-currency');
}

function setCurrencyType(type) {
  appState.currencyType = type;
  document.getElementById('btn-type-plus').classList.toggle('active', type === 'plus');
  document.getElementById('btn-type-minus').classList.toggle('active', type === 'minus');
}

function setQuickAmount(val) {
  document.getElementById('currency-amount').value = val;
}

function setQuickReason(text) {
  document.getElementById('currency-reason').value = text;
}

function submitCurrencyForm() {
  const amount = parseInt(document.getElementById('currency-amount').value);
  const reason = document.getElementById('currency-reason').value.trim() || '선생님 보상/차감';

  if (isNaN(amount) || amount <= 0) {
    showToast("올바른 화폐 금액을 입력해 주세요.", "warning");
    return;
  }

  const isPlus = appState.currencyType === 'plus';

  appState.students.forEach(student => {
    if (appState.selectedStudentIds.has(student.id)) {
      if (isPlus) {
        student.balance += amount;
        student.totalXP += amount; // 1:1 XP 연동
        student.history.unshift({
          date: getTodayString(),
          type: 'plus',
          amount: amount,
          reason: reason
        });
      } else {
        student.balance = Math.max(0, student.balance - amount);
        student.history.unshift({
          date: getTodayString(),
          type: 'minus',
          amount: amount,
          reason: reason
        });
      }
    }
  });

  saveStateToLocalStorage();
  closeModal('modal-currency');
  renderTeacherView();
  showToast(`선택한 ${appState.selectedStudentIds.size}명 학생에게 ${amount} Gold가 ${isPlus ? '지급' : '차감'}되었습니다.`, "success");
}

function openAddMissionModal() {
  openModal('modal-add-mission');
}

function submitAddMission() {
  const title = document.getElementById('mission-title').value.trim();
  const reward = parseInt(document.getElementById('mission-reward').value);

  if (!title || isNaN(reward) || reward <= 0) {
    showToast("미션 제목과 보상 금액을 확인해 주세요.", "warning");
    return;
  }

  const newMission = {
    id: Date.now(),
    title: title,
    reward: reward,
    completedStudents: []
  };

  appState.missions.unshift(newMission);
  saveStateToLocalStorage();
  closeModal('modal-add-mission');
  renderTeacherView();
  showToast("새로운 학급 미션이 추가되었습니다.", "success");
}

function deleteMission(missionId) {
  appState.missions = appState.missions.filter(m => m.id !== missionId);
  saveStateToLocalStorage();
  renderTeacherView();
  showToast("학급 미션이 삭제되었습니다.", "info");
}

function openAddShopItemModal() {
  openModal('modal-add-shop-item');
}

function submitAddShopItem() {
  const name = document.getElementById('shop-item-name').value.trim();
  const emoji = document.getElementById('shop-item-emoji').value.trim() || '🎁';
  const price = parseInt(document.getElementById('shop-item-price').value);
  const desc = document.getElementById('shop-item-desc').value.trim();

  if (!name || isNaN(price) || price <= 0) {
    showToast("상품명과 가격을 확인해 주세요.", "warning");
    return;
  }

  const newItem = {
    id: Date.now(),
    name: name,
    emoji: emoji,
    price: price,
    desc: desc || "학급 상점 쿠폰",
    stock: 99
  };

  appState.shopItems.push(newItem);
  saveStateToLocalStorage();
  closeModal('modal-add-shop-item');
  renderTeacherView();
  showToast("새로운 상점 상품이 추가되었습니다.", "success");
}

function deleteShopItem(itemId) {
  appState.shopItems = appState.shopItems.filter(i => i.id !== itemId);
  saveStateToLocalStorage();
  renderTeacherView();
  showToast("상점 상품이 삭제되었습니다.", "info");
}

// ================= TOAST NOTIFICATION UTILS =================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'warning') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function setupEventListeners() {
  // ESC Key to close active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeBackdrop = document.querySelector('.modal-backdrop.active');
      if (activeBackdrop) {
        activeBackdrop.classList.remove('active');
      }
    }
  });
}
