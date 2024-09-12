// 페이징 관련 변수
let currentPage = 0;
const pageSize = 10;
const maxVisiblePages = 10; // 최대 표시 페이지 수
let totalPages = 1;

// 이적 데이터 관련 변수
let totalTransfers = [];
let mappedTransfers = [];

// CSRF 토큰 관련 변수
const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

// form 데이터를 객체로 변환하는 함수
const formToObject = (form) =>
    Array.from(new FormData(form)).reduce(
        (acc, [key, value]) => ({...acc, [key]: value}),
        {}
    );

// 이적 데이터 가져오기
function fetchTransferData(page) {
    // 수정: API 엔드포인트 URL 변경
    let url = `/transfers?page=${page}&size=${pageSize}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.content) {
                throw new Error('데이터 형식이 예상과 다릅니다');
            }
            totalTransfers = data.content;
            totalPages = data.totalPages;

            const pageButtons = document.querySelector("#pageButtons");

            let tableBody = document.getElementById('transferTableBody');

            if (Array.isArray(data.content) && data.content.length > 0) {
                mappedTransfers = data.content
                    .map(
                        (transfer) => {
                            return `<tr class="transfer-rows" data-id="${transfer.transferIdx}">
                                <td>
                                    <input type="checkbox" class="delete-checkbox" data-id="${transfer.transferIdx}">
                                </td>
                                <td>
                                    ${transfer.transferType == 1 ? '영입' : '방출'}
                                </td>
                                <td>
                                    ${transfer.person ? transfer.person.personName : ''}
                                </td>
                                <td>
                                    ${transfer.opponent}
                                </td>
                                <td>
                                    ${new Date(transfer.tradingDate).toLocaleDateString()}
                                </td>
                            </tr>`;
                        }
                    );
                tableBody.innerHTML = mappedTransfers.join('');
            } else {
                tableBody.innerHTML = '<tr><td colspan="5">데이터가 없습니다</td></tr>';
            }

            // 페이지 버튼 초기화
            pageButtons.innerHTML = '';

            // 중앙을 기준으로 10페이지 생성
            let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages);

            if (endPage - startPage < maxVisiblePages) {
                startPage = Math.max(0, endPage - maxVisiblePages);
            }

            // 페이징 버튼 생성
            for (let i = startPage; i < endPage; i++) {
                pageButtons.innerHTML += `
			        <li class="page-item ${i === page ? 'active' : ''}">
			            <button class="page-link" onclick="fetchTransferData(${i})">${i + 1}</button>
			        </li>`;
            }

            // 이전/다음 그룹 버튼 활성화/비활성화 설정
            document.querySelector("#prevGroup").disabled = currentPage === 0;
            document.querySelector("#nextGroup").disabled = currentPage >= totalPages - 1;

            // 리스트 첫번째 데이터 상세보기
            if (totalTransfers.length > 0) {
                console.log(totalTransfers[0]);
                showDetail(totalTransfers[0]);
            }
        })
        .catch(error => {
            console.error('데이터를 가져오는 중 오류 발생', error);
            document.getElementById('transferTableBody').innerHTML = '<tr><td colspan="5">데이터 로딩 중 오류 발생</td></tr>';
        });
}

// 상세보기
function showDetail(transfer) {
    if (!transfer) return;

    // 수정: 각 필드에 대해 요소가 존재하는지 확인 후 값 설정
    const editTransferType = document.getElementById('editTransferType');
    if (editTransferType) editTransferType.value = transfer.transferType;

    const tradingDate = document.getElementById('tradingDate');
    if (tradingDate) tradingDate.value = new Date(transfer.tradingDate).toISOString().split('T')[0];

    const price = document.getElementById('price');
    if (price) price.value = transfer.price;

    const opponent = document.getElementById('opponent');
    if (opponent) opponent.value = transfer.opponent;

    const transferMemo = document.getElementById('transferMemo');
    if (transferMemo) transferMemo.value = transfer.transferMemo;

    const transferId = document.getElementById('transferId');
    if (transferId) transferId.value = transfer.transferIdx;

    // 선수 정보 업데이트
    const playerImage = document.getElementById('playerImage');
    const playerName = document.querySelector('td[data-field="personName"]');
    const playerPosition = document.querySelector('td[data-field="position"]');
    const playerHeight = document.querySelector('td[data-field="height"]');
    const playerWeight = document.querySelector('td[data-field="weight"]');

    if (transfer.person) {
        if (playerImage) playerImage.src = transfer.person.personImage ? `/img/persons/${transfer.person.personImage}` : '/img/persons/default.png';
        if (playerName) playerName.textContent = transfer.person.personName;
        if (playerPosition) playerPosition.textContent = transfer.person.position;
        if (playerHeight) playerHeight.textContent = `${transfer.person.height}cm`;
        if (playerWeight) playerWeight.textContent = `${transfer.person.weight}kg`;
    }
}

// 특정 이적 정보 상세보기
document.addEventListener('DOMContentLoaded', function() {
    const transferTableBody = document.getElementById('transferTableBody');
    if (transferTableBody) {
        transferTableBody.addEventListener('click', function (e) {
            const row = e.target.closest('tr.transfer-rows');

            if (row) {
                const transferIdx = row.getAttribute('data-id');
                const transfer = totalTransfers.find(transfer => transfer.transferIdx === parseInt(transferIdx));
                if (transfer) {
                    showDetail(transfer);
                }
            }
        });
    }

    // 이적 추가 버튼 이벤트 리스너
    const openAddModalButton = document.getElementById('openAddTransferModalButton');
    if (openAddModalButton) {
        openAddModalButton.addEventListener('click', openAddTransferModal);
    }

    // 이적 정보 추가 버튼 이벤트 리스너
    const addTransferButton = document.getElementById('addTransferButton');
    if (addTransferButton) {
        addTransferButton.addEventListener('click', addTransfer);
    }

    // 초기 데이터 로드
    fetchTransferData(currentPage);
});

// 이적 추가 모달
function openAddTransferModal() {
    // 모달 열기
    const addModal = new bootstrap.Modal(document.getElementById('addTransferModal'));
    addModal.show();
}

// 이적 정보 추가
function addTransfer() {
    const transferType = document.querySelector('input[name="addTransferType"]:checked').value;
    const personName = document.getElementById('addPersonName').value;
    const opponent = document.getElementById('addOpponent').value;
    const tradingDate = document.getElementById('addTradingDate').value;
    const price = document.getElementById('addPrice').value;
    const transferMemo = document.getElementById('addTransferMemo').value;

    const newTransfer = {
        transferType: transferType,
        personName: personName,
        opponent: opponent,
        tradingDate: tradingDate,
        price: price,
        transferMemo: transferMemo
    };

    // 이적 추가 POST 요청
    fetch('/transfers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify(newTransfer)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            fetchTransferData(currentPage); // 이적 목록 갱신
            const modal = bootstrap.Modal.getInstance(document.getElementById('addTransferModal'));
            modal.hide(); // 모달 닫기
            alert('이적 정보가 성공적으로 추가되었습니다.');
        })
        .catch((error) => {
            console.error('오류:', error);
            alert('이적 정보 추가 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
        });
}

document.addEventListener('DOMContentLoaded', function () {
    fetchTransferData(currentPage); // 수정: fetchCoachData를 fetchTransferData로 변경


// 페이징 - 이전 페이지
    document.querySelector("#prevGroup").onclick = () => {
        if (currentPage > 0) {
            currentPage--;
            fetchTransferData(currentPage);
        }
    };

// 페이징 - 다음 페이지
    document.querySelector("#nextGroup").onclick = () => {
        if (currentPage < totalPages - 1) {
            currentPage++;
            fetchTransferData(currentPage);
        }
    };
})