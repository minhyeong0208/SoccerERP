let currentPage = 0;
const pageSize = 10;
const maxVisiblePages = 10; // 최대 표시 페이지 수
let totalPages = 1;

const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

function loadSponsorData(page) {
	
	const startDate = document.querySelector('#startDate').value;
	const endDate = document.querySelector('#endDate').value;
	const keyword = document.querySelector('#searchKeyword').value;

	// 날짜 비교: startDate가 있고, endDate가 있으며, startDate가 endDate보다 클 경우
	if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
		alert("시작 날짜는 종료 날짜보다 이전이어야 합니다.");
		return; // 더 이상 진행하지 않음
	}

	let url = `/sponsors?page=${page}&size=${pageSize}`;
	if (startDate) url += `&startDate=${startDate}`;
	if (endDate) url += `&endDate=${endDate}`;
//	if (keyword) url += `&keyword=${keyword}`;

	fetch(url)
		.then(response => response.json())
		.then(data => {
			const table = document.querySelector("#sponsorTable tbody");
			const pageButtons = document.querySelector("#pageButtons");

			// 총 페이지 수 계산
			totalPages = data.totalPages;

			// 기존 테이블 내용 지우기
			table.innerHTML = '';

			// 새로운 데이터 추가
			data.content.forEach(sponsor => {
				// 날짜 데이터를 YYYY-MM-DD 형식으로 변환
				const contractDate = new Date(sponsor.contractDate).toISOString().substring(0, 10);
				const startDate = new Date(sponsor.startDate).toISOString().substring(0, 10);
				const endDate = new Date(sponsor.endDate).toISOString().substring(0, 10);
				
				table.innerHTML += `
			        <tr data-id="${sponsor.sponsorIdx}">
			            <td><input type="checkbox" class="delete-checkbox" data-id="${sponsor.sponsorIdx}"></td>
			            <td class="editable" data-field="sponsorName">${sponsor.sponsorName}</td>
			            <td class="editable" data-field="contractDate">${contractDate}</td>
			            <td class="editable" data-field="price">${sponsor.price}</td>
			            <td class="editable" data-field="contractCondition">${sponsor.contractCondition}</td>
			            <td class="editable" data-field="startDate">${startDate}</td>
						<td class="editable" data-field="endDate">${endDate}</td>
			            <td class="editable" data-field="sponsorMemo">${sponsor.sponsorMemo}</td>
			        </tr>`;
			});

			// 페이지 버튼 초기화
			pageButtons.innerHTML = '';

			// 중앙을 기준으로 10페이지 생성
			let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
			let endPage = Math.min(totalPages, startPage + maxVisiblePages);

			if (endPage - startPage < maxVisiblePages) {
				startPage = Math.max(0, endPage - maxVisiblePages);
			}

			for (let i = startPage; i < endPage; i++) {
				pageButtons.innerHTML += `
			        <li class="page-item ${i === page ? 'active' : ''}">
			            <button class="page-link" onclick="loadSponsorData(${i})">${i + 1}</button>
			        </li>`;
			}

			// 이전/다음 그룹 버튼 활성화/비활성화 설정
			document.querySelector("#prevGroup").disabled = currentPage === 0;
			document.querySelector("#nextGroup").disabled = currentPage >= totalPages - 1;
		})
		.catch(error => console.error('Error fetching data:', error));
}

// 모달 인스턴스를 생성
const sponsorModal = new bootstrap.Modal(document.getElementById('sponsorModal'));

// 추가 버튼 클릭 시 데이터 처리
document.getElementById("submitSponsor").onclick = function() {
	const sponsorName = document.getElementById("sponsorName").value;
	const contractDate = document.getElementById("contractDate").value;
	const price = document.getElementById("contractPrice").value;
	const contractCondition = document.getElementById("contractCondition").value;
	const sponsorMemo = document.getElementById("sponsorMemo").value;
	const startDate = document.getElementById("startDate").value;
	const endDate = document.getElementById("endDate").value;

	const sponsorData = {
		sponsorName: sponsorName,
		contractDate: contractDate,
		price: parseInt(price),
		contractCondition: contractCondition,
		sponsorMemo: sponsorMemo,
		startDate: startDate,
		endDate: endDate
	};

	fetch(`/sponsors`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			[csrfHeader]: csrfToken
		},
		body: JSON.stringify(sponsorData)
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			console.log('Success:', data);
			const modal = bootstrap.Modal.getInstance(document.getElementById("sponsorModal"));
			modal.hide(); // 모달 닫기
			loadSponsorData(currentPage); // 데이터 재로드
		})
		.catch(error => {
			console.error('Error:', error);
		});
}



document.addEventListener("DOMContentLoaded", function() {
	loadSponsorData(currentPage);
});