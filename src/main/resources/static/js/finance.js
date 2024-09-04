let currentPage = 0;
const pageSize = 10;
const maxVisiblePages = 10; // 최대 표시 페이지 수
let totalPages = 1;

function loadFinanceData(page) {
	// 선택한 financeType 값을 가져옵니다.
	const financeType = document.querySelector('input[name="financeType"]:checked').value;
	const startDate = document.querySelector('#startDate').value;
	const endDate = document.querySelector('#endDate').value;

	// API 호출 URL에 financeType을 추가합니다.
	let url = `http://localhost/finances?page=${page}&size=${pageSize}`;
	if (financeType) url += `&type=${financeType}`;
	if (startDate) url += `&startDate=${startDate}`;
	if (endDate) url += `&endDate=${endDate}`;

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
				checkboxCell.appendChild(checkbox);

				const financeTypeCell = document.createElement("td");
				financeTypeCell.textContent = finance.financeType;

				const financeDateCell = document.createElement("td");
				financeDateCell.textContent = finance.financeDate;

				const amountCell = document.createElement("td");
				amountCell.textContent = finance.amount;

				const traderCell = document.createElement("td");
				traderCell.textContent = finance.trader;

				const purposeCell = document.createElement("td");
				purposeCell.textContent = finance.purpose;

				const financeMemoCell = document.createElement("td");
				financeMemoCell.textContent = finance.financeMemo;

				row.appendChild(checkboxCell);
				row.appendChild(financeTypeCell);
				row.appendChild(financeDateCell);
				row.appendChild(amountCell);
				row.appendChild(traderCell);
				row.appendChild(purposeCell);
				row.appendChild(financeMemoCell);

				table.appendChild(row);
			});

			// 페이지 버튼 초기화
			while (pageButtons.firstChild) {
				pageButtons.removeChild(pageButtons.firstChild);
			}

			// 중앙을 기준으로 10페이지 생성
			let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
			let endPage = Math.min(totalPages, startPage + maxVisiblePages);

			// Start page adjustment if at the end of the total pages
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

// 모달 관련 코드
// 모달 엘리먼트 가져오기
const modal = document.getElementById("financeModal");
const modalTitle = document.getElementById("modalTitle");
const dateLabel = document.getElementById("dateLabel");
const addFinanceButton = document.getElementById("addFinanceButton");
const closeButtons = document.getElementsByClassName("close");

// 모달 내의 라디오 버튼 가져오기
const modalIncomeRadio = document.getElementById("modalIncomeRadio");
const modalExpenseRadio = document.getElementById("modalExpenseRadio");

// 모달 열기 (기본적으로 수입 모달로 열림)
addFinanceButton.onclick = function() {
	modalTitle.innerText = "수입 항목 추가";
	dateLabel.innerText = "수입 날짜:";
	modalIncomeRadio.checked = true;
	modal.style.display = "block";
}

// 라디오 버튼에 따라 모달 내용 변경
modalIncomeRadio.onclick = function() {
	modalTitle.innerText = "수입 항목 추가";
	dateLabel.innerText = "수입 날짜:";
}

modalExpenseRadio.onclick = function() {
	modalTitle.innerText = "지출 항목 추가";
	dateLabel.innerText = "지출 날짜:";
}

// 모달 닫기
for (let i = 0; i < closeButtons.length; i++) {
	closeButtons[i].onclick = function() {
		modal.style.display = "none";
	}
}

// 모달 외부를 클릭하면 닫기
window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}

// 추가 버튼 클릭 시 데이터 처리
document.getElementById("submitFinance").onclick = function() {
	const financeType = modalIncomeRadio.checked ? "수입" : "지출";
	const financeDate = document.getElementById("financeDate").value;
	const amount = document.getElementById("amount").value;
	const trader = document.getElementById("trader").value;
	const purpose = document.getElementById("purpose").value;
	const financeMemo = document.getElementById("financeMemo").value;

	const financeData = {
		financeType: financeType,
		financeDate: financeDate,
		amount: parseInt(amount), // 숫자형으로 변환
		trader: trader,
		purpose: purpose,
		financeMemo: financeMemo
	};

	// CSRF 토큰을 메타 태그에서 가져옴
	const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
	const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

	fetch(`/finances/${financeType === '수입' ? 'income' : 'expense'}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			[csrfHeader]: csrfToken // CSRF 토큰을 헤더에 포함
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
		location.reload(); // 페이지 새로 고침 (새 데이터를 반영)
	})
	.catch(error => {
		console.error('Error:', error);
	});
}

// 라디오 버튼 변경 시 데이터를 로드하도록 이벤트 리스너 추가
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

// 처음 로드할 때 데이터 로드
document.addEventListener("DOMContentLoaded", function() {
	loadFinanceData(currentPage);
});