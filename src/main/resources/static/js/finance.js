let currentPage = 0;
const pageSize = 10;
const maxVisiblePages = 10; // 최대 표시 페이지 수
let totalPages = 1;

function loadFinanceData(page) {
	const financeType = document.querySelector('input[name="financeType"]:checked').value;
	const startDate = document.querySelector('#startDate').value;
	const endDate = document.querySelector('#endDate').value;
	const keyword = document.querySelector('#searchKeyword').value;

	let url = `http://localhost/finances?page=${page}&size=${pageSize}`;
	if (financeType) url += `&type=${financeType}`;
	if (startDate) url += `&startDate=${startDate}`;
	if (endDate) url += `&endDate=${endDate}`;
	if (keyword) url += `&keyword=${keyword}`;

	fetch(url)
		.then(response => response.json())
		.then(data => {
			const table = document.querySelector("#financeTable");
			const pageButtons = document.querySelector("#pageButtons");

			// 총 페이지 수 계산
			totalPages = data.totalPages;

			// 기존 테이블 내용 지우기 (헤더 제외)
			const rows = table.querySelectorAll("tr:not(:first-child)");
			rows.forEach(row => table.removeChild(row));

			// 새로운 데이터 추가
			data.content.forEach(finance => {
				const row = document.createElement("tr");

				const checkboxCell = document.createElement("td");
				const checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				checkbox.classList.add("delete-checkbox");
				checkbox.setAttribute("data-id", finance.financeIdx);
				checkboxCell.appendChild(checkbox);

				// 수입/지출 타입 컬럼의 경우, 수정 불가
				const financeTypeCell = document.createElement("td");
				financeTypeCell.textContent = finance.financeType;

				const financeDateCell = document.createElement("td");
				financeDateCell.textContent = finance.financeDate;
				financeDateCell.classList.add('editable');
				financeDateCell.setAttribute('data-field', 'financeDate');

				const amountCell = document.createElement("td");
				amountCell.textContent = finance.amount;
				amountCell.classList.add('editable');
				amountCell.setAttribute('data-field', 'amount');

				const traderCell = document.createElement("td");
				traderCell.textContent = finance.trader;
				traderCell.classList.add('editable');
				traderCell.setAttribute('data-field', 'trader');

				const purposeCell = document.createElement("td");
				purposeCell.textContent = finance.purpose;
				purposeCell.classList.add('editable');
				purposeCell.setAttribute('data-field', 'purpose');

				const financeMemoCell = document.createElement("td");
				financeMemoCell.textContent = finance.financeMemo;
				financeMemoCell.classList.add('editable');
				financeMemoCell.setAttribute('data-field', 'financeMemo');

				row.appendChild(checkboxCell);
				row.appendChild(financeTypeCell);
				row.appendChild(financeDateCell);
				row.appendChild(amountCell);
				row.appendChild(traderCell);
				row.appendChild(purposeCell);
				row.appendChild(financeMemoCell);
				row.setAttribute('data-id', finance.financeIdx); // 각 행에 고유 ID 설정

				table.appendChild(row);
			});

			// 각 셀에 더블 클릭 시 편집 가능하도록 이벤트 리스너 추가
			document.querySelectorAll('.editable').forEach(cell => {
				cell.addEventListener('dblclick', editField);
			});

			// 페이지 버튼 초기화
			while (pageButtons.firstChild) {
				pageButtons.removeChild(pageButtons.firstChild);
			}

			// 중앙을 기준으로 10페이지 생성
			let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
			let endPage = Math.min(totalPages, startPage + maxVisiblePages);

			if (endPage - startPage < maxVisiblePages) {
				startPage = Math.max(0, endPage - maxVisiblePages);
			}

			for (let i = startPage; i < endPage; i++) {
				const button = document.createElement("button");
				button.textContent = i + 1;
				button.disabled = i === page;
				button.onclick = () => {
					currentPage = i;
					loadFinanceData(currentPage);
				};
				pageButtons.appendChild(button);
			}

			// 이전/다음 그룹 버튼 활성화/비활성화 설정
			document.querySelector("#prevGroup").disabled = currentPage === 0;
			document.querySelector("#nextGroup").disabled = currentPage >= totalPages - 1;
		})
		.catch(error => console.error('Error fetching data:', error));
}

// 셀을 더블 클릭 시 인라인 편집 가능하도록 설정하는 함수
function editField(event) {
	const cell = event.target;
	const originalValue = cell.textContent;
	const field = cell.getAttribute('data-field');
	const row = cell.closest('tr');
	const id = row.getAttribute('data-id');

	const inputType = field === 'financeDate' ? 'date' : 'text';
	const input = document.createElement('input');
	input.type = inputType;
	input.classList.add('editable-input');
	input.value = originalValue;

	cell.textContent = ''; // 셀의 내용을 비우고
	cell.appendChild(input); // 인풋 필드로 변경

	input.focus(); // 인풋 필드에 포커스

	input.addEventListener('blur', function() {
		const newValue = input.value.trim();
		cell.textContent = newValue; // 인풋 필드를 원래 텍스트로 변환

		if (newValue !== originalValue) {
			updateFinanceData(id, field, newValue); // 값이 변경되었을 경우 서버에 업데이트
		}
	});

	input.addEventListener('keydown', function(e) {
		if (e.key === 'Enter') {
			input.blur(); // 엔터를 누르면 포커스 해제
		}
	});
}

function updateFinanceData(id) {
	const row = document.querySelector(`tr[data-id="${id}"]`);

	const financeDate = row.querySelector('[data-field="financeDate"]').textContent;
	const amount = row.querySelector('[data-field="amount"]').textContent;
	const trader = row.querySelector('[data-field="trader"]').textContent;
	const purpose = row.querySelector('[data-field="purpose"]').textContent;
	const financeMemo = row.querySelector('[data-field="financeMemo"]').textContent;

	const updatedData = {
		financeDate: financeDate,
		amount: amount,
		trader: trader,
		purpose: purpose,
		financeMemo: financeMemo
	};

	const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
	const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

	fetch(`http://localhost/finances/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			[csrfHeader]: csrfToken
		},
		body: JSON.stringify(updatedData)
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Error updating data');
			}
			return response.json();
		})
		.then(data => {
			console.log('수정 완료:', data);
		})
		.catch(error => {
			console.error('수정 오류:', error);
		});
}

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

		fetch(`http://localhost/finances`, {
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

// 모달 관련 코드
const modal = document.getElementById("financeModal");
const modalTitle = document.getElementById("modalTitle");
const dateLabel = document.getElementById("dateLabel");
const addFinanceButton = document.getElementById("addFinanceButton");
const closeButtons = document.getElementsByClassName("close");

// 모달 열기 (기본적으로 수입 모달로 열림)
addFinanceButton.onclick = function () {
	modalTitle.innerText = "수입 항목 추가";
	dateLabel.innerText = "수입 날짜:";
	document.getElementById("modalIncomeRadio").checked = true;
	modal.style.display = "block";
}

// 라디오 버튼에 따라 모달 내용 변경
document.getElementById("modalIncomeRadio").onclick = function () {
	modalTitle.innerText = "수입 항목 추가";
	dateLabel.innerText = "수입 날짜:";
}

document.getElementById("modalExpenseRadio").onclick = function () {
	modalTitle.innerText = "지출 항목 추가";
	dateLabel.innerText = "지출 날짜:";
}

// 모달 닫기
for (let i = 0; i < closeButtons.length; i++) {
	closeButtons[i].onclick = function () {
		modal.style.display = "none";
	}
}

window.onclick = function (event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}

// 추가 버튼 클릭 시 데이터 처리
document.getElementById("submitFinance").onclick = function () {
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
		loadFinanceData(currentPage);
	});
});

document.querySelector("#prevGroup").onclick = () => {
	if (currentPage > 0) {
		currentPage--;
		loadFinanceData(currentPage);
	}
};

document.querySelector("#nextGroup").onclick = () => {
	if (currentPage < totalPages - 1) {
		currentPage++;
		loadFinanceData(currentPage);
	}
};

document.querySelector("#searchButton").onclick = () => {
	currentPage = 0;
	loadFinanceData(currentPage);
};

// 페이지 로드 시 데이터 로드
document.addEventListener("DOMContentLoaded", function () {
	loadFinanceData(currentPage);
});

// 삭제 버튼 클릭 시 삭제 실행
document.querySelector("#deleteFinanceButton").onclick = () => {
	deleteSelectedFinances();
};

// "전체 선택" 체크박스 클릭 시 이벤트
document.querySelector("#selectAllCheckbox").addEventListener("change", function () {
	const isChecked = this.checked;
	const checkboxes = document.querySelectorAll(".delete-checkbox");

	checkboxes.forEach(checkbox => {
		checkbox.checked = isChecked;
	});
});
