let currentPage = 0;
const pageSize = 10;
const maxVisiblePages = 10; // 최대 표시 페이지 수
let totalPages = 1;

function loadTrainData(page) {
	let url = `http://localhost/trains`;
	fetch(url)
		.then(response => response.json())
		.then(data => {
			const table = document.querySelector("#trainTable tbody");
			const pageButtons = document.querySelector("#pageButtons");

			// 총 페이지 수 계산
			totalPages = data.totalPages;

			// 기존 테이블 내용 지우기
			table.innerHTML = '';

			data.content.forEach(train => {
				table.innerHTML += `
					<tr data-id="${train.trainIdx}">
						<td><input type="checkbox" class="delete-checkbox" data-id="${train.trainIdx}"></td>
						<td>${train.trainName}</td>
						<td>${formatTime(train.startTime)}</td>		
						<td>${formatTime(train.endTime)}</td>					
						<td>${formatDate(train.startDate)}</td>
						<td>${formatDate(train.endDate)}</td>
						<td>${train.countMem}</td>
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

// 날짜 형식 변환 함수
function formatDate(dateStr) {
	const date = new Date(dateStr);
  	return date.toISOString().split('T')[0]; // 'YYYY-MM-DD' 형식으로 변환
}

// 시간 형식 변환 함수
function formatTime(dateStr) {
  	const time = new Date(dateStr);
  	return time.toISOString().split('T')[1].substring(0, 5); // 'HH:MM' 형식으로 변환
}

// 페이지 로드 시 데이터 로드
document.addEventListener("DOMContentLoaded", function() {
	loadTrainData(currentPage);
});