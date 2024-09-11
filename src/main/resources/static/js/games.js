// 전역 변수 선언
let currentPage = 0;
let gameType = '';
const pageSize = 10;
let gameData = null;

const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

document.addEventListener('DOMContentLoaded', function() {
    // 초기 데이터 설정 및 게임 목록 로드
    initializeGameData();
    loadGames(currentPage);

    // 전체 선택 체크박스 이벤트 리스너
    document.getElementById('selectAll').addEventListener('change', function() {
            const checkboxes = document.getElementsByName('selectedMatches');
            for(let checkbox of checkboxes) {
            checkbox.checked = this.checked;
        }
    });

    // 게임 유형 필터 이벤트 리스너
    document.querySelectorAll('input[name="gameTypeFilter"]').forEach(radio => {
        radio.addEventListener('change', function() {
            gameType = this.value === '전체' ? '' : this.value;
            currentPage = 0;
            loadGames(currentPage);
        });
    });

    // 득점, 실점 Column 더블클릭 시 수정
    document.querySelector('#gameTableBody').addEventListener('dblclick', e => {
        // 클릭된 요소가 득점(3번째 열) 또는 실점(4번째 열) 셀인지 확인
        if (e.target.cellIndex !== 0) {
            const row = e.target.closest('tr');
            if (row) {
                const checkbox = row.querySelector('input[type=checkbox]');
                const value = checkbox.getAttribute('value');

                openEditModal(value);
            }
        }
    })

    // 수정 저장 버튼 클릭 이벤트
    document.getElementById('editGame').addEventListener('click', editGame);

    // 경기 추가 버튼 이벤트 리스너
    document.getElementById('saveGame').addEventListener('click', addGame);

    // 선택 삭제 버튼 이벤트 리스너
    document.getElementById('deleteSelectedBtn').addEventListener('click', showDeleteConfirmModal);

    // 삭제 확인 버튼 이벤트 리스너
    document.getElementById('confirmDelete').addEventListener('click', deleteGame);

    // 최근 경기 정보 초기 로드 및 주기적 업데이트
    updateMostRecentGame();
    setInterval(updateMostRecentGame, 30000); // 30초마다 업데이트
});

// 경기 수정 모달
function openEditModal(gameIdx) {
    document.getElementById('editGameIdx').value = gameIdx;

    // 서버에서 게임 정보 가져오기
    fetch(`/games/${gameIdx}`, {
        headers: {
            [csrfHeader]: csrfToken
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('게임 정보를 가져오는데 실패했습니다.');
        }
        return response.json();
    })
    .then(game => {
        // 폼 필드 초기화
        document.getElementById('editGameName').value = game.gameName;
        document.getElementById('editGameDate').value = formatDate(game.gameDate);
        document.getElementById('editOpponent').value = game.opponent;
        document.getElementById('editStadium').value = game.stadium;
        document.getElementById('editGoal').value = game.goal;
        document.getElementById('editConcede').value = game.concede;

        // 라디오 버튼 설정
        if (game.gameType === '리그') {
            document.getElementById('editTypeLeague').checked = true;
        } else if (game.gameType === '토너먼트') {
            document.getElementById('editTypeTournament').checked = true;
        }

        // 모달 열기
        const editModal = new bootstrap.Modal(document.getElementById('editGameModal'));
        editModal.show();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('경기 정보를 불러오는 중 오류가 발생했습니다.');
    });
}

// 날짜 포맷 함수 (YYYY-MM-DD)
function formatDate(dateString) {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000; // 분을 밀리초로 변환
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().split('T')[0];
}

function initializeGameData() {
    const initialDataElement = document.getElementById('initialData');
    if (initialDataElement) {
        try {
            gameData = JSON.parse(initialDataElement.textContent);
            // 날짜 형식 변환
            if (gameData && gameData.gameDate) {
                gameData.gameDate = formatDate(gameData.gameDate);
            }
        } catch (error) {
            console.error('Error parsing initial data:', error);
        }
    }
}

function loadGames(page) {
    fetch(`/games/list?page=${page}&size=${pageSize}&gameType=${gameType}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 응답이 올바르지 않습니다.');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.content) {
                updateTable(data.content);
                updatePagination(data);
            } else {
                throw new Error('유효하지 않은 데이터 형식');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const tableBody = document.getElementById('gameTableBody');
            tableBody.innerHTML = '<tr><td colspan="8">데이터를 불러오는 중 오류가 발생했습니다.</td></tr>';
    });
}

function updateTable(games) {
    const tableBody = document.getElementById('gameTableBody');
    tableBody.innerHTML = '';

    if (!Array.isArray(games) || games.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8">표시할 게임 데이터가 없습니다.</td></tr>';
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);  // 시간을 00:00:00으로 설정

    games.forEach(game => {
        if (game && typeof game === 'object') {
            const gameDate = new Date(game.gameDate);
            gameDate.setHours(0, 0, 0, 0);  // 시간을 00:00:00으로 설정

            let goalDisplay = game.goal;
            let concedeDisplay = game.concede;
            let result;

            if (gameDate > today) {
                goalDisplay = '-';
                concedeDisplay = '-';
                result = '경기 예정';
            } else {
                result = game.goal > game.concede ? '승' : (game.goal < game.concede ? '패' : '무');
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" name="selectedMatches" value="${game.gameIdx || ''}"></td>
                <td>${game.gameType || ''}</td>
                <td>${goalDisplay}</td>
                <td>${concedeDisplay}</td>
                <td>${game.opponent || ''}</td>
                <td>${game.stadium || ''}</td>
                <td>${game.gameDate ? new Date(game.gameDate).toLocaleDateString() : ''}</td>
                <td>${result}</td>
              `;
            tableBody.appendChild(row);
        }
    });
}

// 페이징
function updatePagination(pageData) {
    if (!pageData || typeof pageData.number === 'undefined' || typeof pageData.totalPages === 'undefined') {
        console.error('Invalid page data:', pageData);
        return;
    }

    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const prevLink = createPageLink(pageData.number - 1, '이전', pageData.first);
    pagination.appendChild(prevLink);

    for (let i = 0; i < pageData.totalPages; i++) {
        const pageLink = createPageLink(i, i + 1, false, i === pageData.number);
        pagination.appendChild(pageLink);
    }

    const nextLink = createPageLink(pageData.number + 1, '다음', pageData.last);
    pagination.appendChild(nextLink);
}

function createPageLink(pageNumber, text, disabled = false, active = false) {
    const li = document.createElement('li');
    li.className = `page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}`;

    const a = document.createElement('a');
    a.className = `page-link${text === '이전' ? ' prev' : text === '다음' ? ' next' : ''}`;
    a.href = '#';
    a.textContent = text;

    if (!disabled) {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            loadGames(pageNumber);
        });
    }

    li.appendChild(a);
    return li;
}

// 경기 추가 function
function addGame() {
    const gameType = document.querySelector('input[name="gameType"]:checked').value;
    const gameName = document.getElementById('game_name').value;
    const opponent = document.getElementById('opponent').value;
    const gameDate = document.getElementById('gameDate').value; // 'YYYY-MM-DD' 형식
    const stadium = document.getElementById('stadium').value;
    let goal = document.getElementById('goal').value;
    let concede = document.getElementById('concede').value;

    const newGame = {
        gameName: gameName,
        gameType: gameType,
        opponent: opponent,
        gameDate: gameDate,
        stadium: stadium,
        goal: goal,
        concede: concede
    };

    // 경기 추가 POST 요청
    fetch('/games/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify(newGame)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            loadGames(currentPage); // 경기 목록 갱신
            const modal = bootstrap.Modal.getInstance(document.getElementById('addGameModal'));
            modal.hide(); // 모달 닫기
            alert('경기가 성공적으로 추가되었습니다.');
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('경기 추가 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
        });
}

// 경기 수정 function
function editGame() {
    const gameIdx = document.getElementById('editGameIdx').value;
    const gameType = document.querySelector('input[name="editGameType"]:checked').value;
    const gameName = document.getElementById('editGameName').value;
    const opponent = document.getElementById('editOpponent').value;
    const gameDate = document.getElementById('editGameDate').value; // 'YYYY-MM-DD' 형식으로 입력 확인
    const stadium = document.getElementById('editStadium').value;
    const goal = document.getElementById('editGoal').value;
    const concede = document.getElementById('editConcede').value;

    // 오늘 날짜와 비교
    const today = new Date().toISOString().split('T')[0];

    // 미래 경기의 경우 득점과 실점이 0인지 확인
    if (gameDate > today && (goal !== "0" || concede !== "0")) {
        alert('미래 경기의 득점과 실점은 0이어야 합니다.');
        return;  // 유효성 검사를 통과하지 못하면 함수 실행 중지
    }

    const newGame = {
        gameIdx: gameIdx,
        gameName: gameName,
        gameType: gameType,
        opponent: opponent,
        gameDate: gameDate,  // 날짜 값이 올바르게 설정되는지 확인
        stadium: stadium,
        goal: goal,
        concede: concede
    };

    // 경기 수정 POST 요청
    fetch('/games/edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify(newGame)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            loadGames(currentPage);  // 테이블 업데이트
            const modal = bootstrap.Modal.getInstance(document.getElementById('editGameModal'));
            modal.hide();  // 모달 닫기
            alert('경기가 성공적으로 수정되었습니다.');
            updateMostRecentGame(); // 최근 경기 갱신
        })
        .catch((error) => {
            console.error('Error:', error);
            // 오류 메시지와 함께 오류 처리
            alert('경기 수정 중 오류가 발생했습니다: ' + (error.message || '미래 경기의 득점과 실점은 0이어야 합니다.'));
        });
}

// 최근 경기 정보를 업데이트하는 함수
function updateMostRecentGame() {
    fetch('/games/mostRecent')
        .then(response => response.json())
        .then(data => {
            if (data) {
                const recentGameElement = document.querySelector('#recent-game');
                const today = new Date().setHours(0,0,0,0);
                const gameDate = new Date(data.gameDate).setHours(0,0,0,0);

                // HTML 템플릿 생성
                const html = `
                    <div class="text-center">
                        <div class="mb-3">
                            <h5>${formatDate(data.gameDate)}</h5>
                        </div>
                        <div class="row align-items-center mb-3">
                            <div class="col-4">
                                <div class="team-logo-container">
                                    <img src="/img/team/강원FC.png" alt="강원 FC 로고" class="team-logo">
                                </div>
                                <br>
                                <h2 class="text">강원 FC</h2>
                            </div>
                            <div class="col-4">
                                <img src="/img/team/versus.png" alt="versus" class="versus-logo">
                            </div>
                            <div class="col-4">
                                <div class="team-logo-container">
                                    <img src="/img/team/${getTeamImageFileName(data.opponent)}" alt="${data.opponent} 로고" class="team-logo">
                                </div>
                                <br>
                                <h2 class="text">${data.opponent}</h2>
                            </div>
                        </div>
                        <div>
                            <h2>${gameDate > today ? '경기 예정' : `${data.goal} : ${data.concede}`}</h2>
                        </div>
                        <div class="mt-3">
                            <p>${data.stadium}</p>
                        </div>
                    </div>
                `;

                // HTML 업데이트
                recentGameElement.innerHTML = html;
            } else {
                const recentGameElement = document.querySelector('#recent-game');
                recentGameElement.innerHTML = '<p class="text-center">최근 경기 정보가 없습니다.</p>';
            }
        })
        .catch(error => {
            console.error('Error updating most recent game:', error);
        });
}

function showDeleteConfirmModal() {
    const selectedGames = document.querySelectorAll('input[name="selectedMatches"]:checked');
    if (selectedGames.length > 0) {
        const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        modal.show();
    } else {
        alert('삭제할 경기를 선택해주세요.');
    }
}

// 삭제 기능 추가
function deleteGame() {
    const selectedCheckboxes = document.querySelectorAll('input[name="selectedMatches"]:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.value);

    if (selectedIds.length === 0) {
        alert('삭제할 항목을 선택하세요.');
        return;
    }

    fetch('/games', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
			[csrfHeader]: csrfToken
        },
        body: JSON.stringify(selectedIds)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || '서버 응답이 올바르지 않습니다.');
                });
            }
            return response.text().then(text => {
                return text ? JSON.parse(text) : {};
            });
        })
        .then(data => {
            console.log('삭제 성공:', data);
            // 페이지 새로고침 또는 테이블 업데이트
            location.reload();
            // 또는 특정 함수를 호출하여 테이블만 업데이트할 수 있습니다.
            // updateTable();
        })
        .catch((error) => {
            console.error('삭제 중 오류 발생:', error);
            alert('경기 삭제 중 오류가 발생했습니다: ' + error.message);
        });

function getTeamImageFileName(teamName) {
    const nameMap = {
        '울산HD': '울산',
        '수원FC': '수원',
        '김천상무FC': '김천',
        '서울FC': '서울',
        '포항 스틸러스': '포항',
        '광주FC': '광주',
        '제주 유나이티드FC': '제주',
        '대전 하나시티즈': '대전',
        '인천 유나이티드FC': '인천',
        '전북 현대': '전북',
        '대구FC': '대구',
        '강원FC': '강원'
    };
    return (nameMap[teamName] || teamName) + '.png';
    }
}