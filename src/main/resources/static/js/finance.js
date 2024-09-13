let currentPage = 0;
const pageSize = 10;
const maxVisiblePages = 10; // 최대 표시 페이지 수
let totalPages = 1;

// CSRF 토큰과 헤더를 가져옴
const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

function loadFinanceData(page) {
	// 페이지 갱신
	currentPage = page;
	
	const financeType = document.querySelector('input[name="financeType"]:checked').value;
	const startDate = document.querySelector('#startDate').value;
	const endDate = document.querySelector('#endDate').value;
	const keyword = document.querySelector('#searchKeyword').value;

	// 날짜 비교: startDate가 있고, endDate가 있으며, startDate가 endDate보다 클 경우
	if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
		alert("시작 날짜는 종료 날짜보다 이전이어야 합니다.");
		return; // 더 이상 진행하지 않음
	}

	let url = `/finances?page=${page}&size=${pageSize}`;
	if (financeType) url += `&type=${financeType}`;
	if (startDate) url += `&startDate=${startDate}`;
	if (endDate) url += `&endDate=${endDate}`;
	if (keyword) url += `&keyword=${keyword}`;

	fetch(url)
		.then(response => response.json())
		.then(data => {
			const table = document.querySelector("#financeTable tbody");
			const pageButtons = document.querySelector("#pageButtons");

			// 총 페이지 수 계산
			totalPages = data.totalPages;

			// 기존 테이블 내용 지우기
			table.innerHTML = '';

			// 새로운 데이터 추가
			data.content.forEach(finance => {
				// 날짜를 YYYY-MM-DD 형식으로 변환
				const financeDate = new Date(finance.financeDate).toISOString().split('T')[0];
				table.innerHTML += `
			        <tr data-id="${finance.financeIdx}">
			            <td><input type="checkbox" class="delete-checkbox" data-id="${finance.financeIdx}"></td>
			            <td>${finance.financeType}</td>
			            <td><input type="date" class="editable form-control form-control-sm" data-field="financeDate" value="${financeDate}"></td>
			            <td><input type="text" class="editable form-control form-control-sm" data-field="amount" value="${finance.amount}"></td>
			            <td><input type="text" class="editable form-control form-control-sm" data-field="trader" value="${finance.trader}"></td>
			            <td><input type="text" class="editable form-control form-control-sm" data-field="purpose" value="${finance.purpose}"></td>
			            <td><input type="text" class="editable form-control form-control-sm" data-field="financeMemo" value="${finance.financeMemo}"></td>
			        </tr>`;
			});


			// 페이지 버튼 초기화
			pageButtons.innerHTML = '';

			// 중앙을 기준으로 10페이지 생성
			let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
			let endPage = Math.min(totalPages, startPage + maxVisiblePages);

			if (endPage - startPage < maxVisiblePages) {
				startPage = Math.max(0, endPage - maxVisiblePages);
			}

			for (let i = startPage; i < endPage; i++) {
				pageButtons.innerHTML += `
			        <li class="page-item ${i === page ? 'active' : ''}">
			            <button class="page-link" onclick="loadFinanceData(${i})">${i + 1}</button>
			        </li>`;
			}

			// 이전/다음 그룹 버튼 활성화/비활성화 설정
			document.querySelector("#prevGroup").disabled = currentPage === 0;
			document.querySelector("#nextGroup").disabled = currentPage >= totalPages - 1;
		})
		.catch(error => console.error('Error fetching data:', error));
}

document.getElementById("updateAllButton").onclick = function() {
    // 모든 수정된 셀의 데이터를 수집
    const rows = document.querySelectorAll("#financeTable tbody tr");
    const updatedFinances = Array.from(rows).map(row => {
        const financeIdx = row.getAttribute('data-id');
        return {
            financeIdx: financeIdx,
            financeDate: row.querySelector('input[data-field="financeDate"]').value,
            amount: parseInt(row.querySelector('input[data-field="amount"]').value),
            trader: row.querySelector('input[data-field="trader"]').value,
            purpose: row.querySelector('input[data-field="purpose"]').value,
            financeMemo: row.querySelector('input[data-field="financeMemo"]').value
        };
    });

    // 수정 확인 메시지
    if (confirm("수정하시겠습니까?")) {
        // 변경된 데이터를 서버로 전송
        updatedFinances.forEach(financeData => {
            fetch(`/finances/${financeData.financeIdx}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    [csrfHeader]: csrfToken
                },
                body: JSON.stringify(financeData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                loadFinanceData(currentPage); // 수정 후 데이터 재로드
            })
            .catch(error => {
                console.error('Error updating data:', error);
            });
        });
    }
	
};

// 삭제 기능 추가
function deleteSelectedFinances() {
	const selectedCheckboxes = document.querySelectorAll('.delete-checkbox:checked');
	const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));

	if (selectedIds.length === 0) {
		alert('삭제할 항목을 선택하세요.');
		return;
	}

	if (confirm('삭제하시겠습니까?')) {
		const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
		const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

		fetch(`/finances`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				[csrfHeader]: csrfToken
			},
			body: JSON.stringify(selectedIds)
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('삭제 오류');
				}
				// 삭제 후 테이블 갱신
				loadFinanceData(currentPage);
			})
			.catch(error => {
				console.error('삭제 오류:', error);
			});
	}
}

// 모달을 띄우기 위한 함수 추가
function showAlertModal(message) {
    // 모달의 내용 변경 (필요에 따라 메시지를 다르게 설정 가능)
    document.querySelector("#alertModal .modal-body").textContent = message;

    // Bootstrap 모달 인스턴스 생성 및 모달 표시
    var alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
    alertModal.show();
}

// 모달 관련 코드
const modal = document.getElementById("financeModal");
const modalTitle = document.getElementById("modalTitle");
const dateLabel = document.getElementById("dateLabel");
const addFinanceButton = document.getElementById("addFinanceButton");
const closeButtons = document.getElementsByClassName("close");

// 모달 열기 (기본적으로 수입 모달로 열림)
addFinanceButton.onclick = function() {
	modalTitle.innerText = "수입 항목 추가";
	dateLabel.innerText = "수입 날짜:";
	document.getElementById("modalIncomeRadio").checked = true;
	modal.style.display = "block";
}

// 라디오 버튼에 따라 모달 내용 변경
document.getElementById("modalIncomeRadio").onclick = function() {
	modalTitle.innerText = "수입 항목 추가";
	dateLabel.innerText = "수입 날짜:";
}

document.getElementById("modalExpenseRadio").onclick = function() {
	modalTitle.innerText = "지출 항목 추가";
	dateLabel.innerText = "지출 날짜:";
}

// 모달 닫기
for (let i = 0; i < closeButtons.length; i++) {
	closeButtons[i].onclick = function() {
		modal.style.display = "none";
	}
}

window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}

// 추가 버튼 클릭 시 데이터 처리
document.getElementById("submitFinance").onclick = function() {
	const financeType = document.getElementById("modalIncomeRadio").checked ? "수입" : "지출";
	const financeDate = document.getElementById("financeDate").value;
	const amount = document.getElementById("amount").value;
	const trader = document.getElementById("trader").value;
	const purpose = document.getElementById("purpose").value;
	const financeMemo = document.getElementById("financeMemo").value;

	const financeData = {
		financeType: financeType,
		financeDate: financeDate,
		amount: parseInt(amount),
		trader: trader,
		purpose: purpose,
		financeMemo: financeMemo
	};

	const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
	const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

	fetch(`/finances/${financeType === '수입' ? 'income' : 'expense'}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			[csrfHeader]: csrfToken
		},
		body: JSON.stringify(financeData)
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			console.log('Success:', data);
			modal.style.display = "none";
			location.reload(); // 새로고침하여 변경 사항 반영
		})
		.catch(error => {
			console.error('Error:', error);
		});
}

// 라디오 버튼 변경 시 데이터를 로드
document.querySelectorAll('input[name="financeType"]').forEach(radio => {
	radio.addEventListener('change', () => {
		currentPage = 0; // 페이지를 초기화합니다.
	});
});

// 이전/다음 버튼 클릭 시 currentPage를 기반으로 페이지 이동
document.querySelector("#prevGroup").onclick = () => {
	if (currentPage > 0) {
		loadFinanceData(currentPage - 1);
	}
};

document.querySelector("#nextGroup").onclick = () => {
	if (currentPage < totalPages - 1) {
		loadFinanceData(currentPage + 1);
	}
};

document.querySelector("#searchButton").onclick = () => {
	currentPage = 0;
	loadFinanceData(currentPage);
};

// 페이지 로드 시 데이터 로드
document.addEventListener("DOMContentLoaded", function() {
	loadFinanceData(currentPage);
});

// 삭제 버튼 클릭 시 삭제 실행
document.querySelector("#deleteFinanceButton").onclick = () => {
	deleteSelectedFinances();
};

// "전체 선택" 체크박스 클릭 시 이벤트
document.querySelector("#selectAllCheckbox").addEventListener("change", function() {
	const isChecked = this.checked;
	const checkboxes = document.querySelectorAll(".delete-checkbox");

	checkboxes.forEach(checkbox => {
		checkbox.checked = isChecked;
	});
});