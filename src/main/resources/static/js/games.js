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

    // 경기 추가 버튼 이벤트 리스너
    document.getElementById('saveGame').addEventListener('click', addGame);

    // 선택 삭제 버튼 이벤트 리스너
    document.getElementById('deleteSelectedBtn').addEventListener('click', showDeleteConfirmModal);

    // 삭제 확인 버튼 이벤트 리스너
    document.getElementById('confirmDelete').addEventListener('click', deleteGame);
});

function testCaller() {
    const selectedItems = document.querySelectorAll('input[name="selectedMatches"]:checked');
    const selectedIds = Array.from(selectedItems).map(checkbox => checkbox.value);
    console.log('# Ids >', selectedIds);
}

function initializeGameData() {
    const initialDataElement = document.getElementById('initialData');
    if (initialDataElement) {
        try {
            gameData = JSON.parse(initialDataElement.textContent);
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

    games.forEach(game => {
        if (game && typeof game === 'object') {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" name="selectedMatches" value="${game.gameIdx || ''}"></td>
                <td>${game.gameType || ''}</td>
                <td>${game.goal || 0}</td>
                <td>${game.concede || 0}</td>
                <td>${game.opponent || ''}</td>
                <td>${game.stadium || ''}</td>
                <td>${game.gameDate ? new Date(game.gameDate).toLocaleDateString() : ''}</td>
                <td>${game.goal > game.concede ? '승' : (game.goal < game.concede ? '패' : '무')}</td>
              `;
            tableBody.appendChild(row);
        }
    });
}

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
    const opponent = document.getElementById('opponent').value;
    const gameDate = document.getElementById('gameDate').value;
    const stadium = document.getElementById('stadium').value;
    const goal = document.getElementById('goal').value;
    const concede = document.getElementById('concede').value;

    const newGame = {
        gameType: gameType,
        opponent: opponent,
        gameDate: gameDate,
        stadium: stadium,
        goal: goal,
        concede: concede

    };

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
            console.log('Success:', data);
            loadGames(currentPage);
            const modal = bootstrap.Modal.getInstance(document.getElementById('addGameModal'));
            modal.hide();
            alert('경기가 성공적으로 추가되었습니다.');
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('경기 추가 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
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
}