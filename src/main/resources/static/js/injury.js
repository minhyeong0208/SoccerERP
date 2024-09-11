$(document).ready(function() {
	// CSRF 토큰과 헤더를 전역으로 선언
	const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
	const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

	let injuryData = [];  // 부상 데이터를 저장할 배열
	let playerData = [];  // 선수 데이터를 저장할 배열
	let currentPage = 0;  // 현재 페이지
	const pageSize = 20;  // 한 페이지에 보여줄 항목 수
	let totalPages = 0;   // 전체 페이지 수
	let selectedIds = [];  // 삭제할 항목의 ID를 저장하는 배열

	// 전체 선택 체크박스 클릭 시 모든 체크박스의 상태를 변경
	$('#selectAllCheckbox').on('click', function() {
		let isChecked = $(this).is(':checked');
		$('.rowCheckbox').prop('checked', isChecked);
	});

	// 개별 체크박스 클릭 시 전체 선택 체크박스의 상태를 업데이트
	$('#injuryTableBody').on('change', '.rowCheckbox', function() {
		let allChecked = $('.rowCheckbox:checked').length === $('.rowCheckbox').length;
		$('#selectAllCheckbox').prop('checked', allChecked);
	});

	// 삭제 버튼 클릭 시 모달을 띄우기
	$('#openDeleteButton').on('click', function() {
		selectedIds = [];  // 이전에 선택된 항목을 초기화
		$('.rowCheckbox:checked').each(function() {
			selectedIds.push($(this).val());
		});

		if (selectedIds.length === 0) {
			alert("삭제할 항목을 선택하세요.");
			return;
		}

		// 삭제 확인 모달 열기
		const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
		deleteConfirmModal.show();
	});

	// 삭제 확인 모달에서 '삭제' 버튼 클릭 시 삭제 작업 실행
	$('#confirmDeleteButton').on('click', function() {
		selectedIds.forEach(function(id) {
			$.ajax({
				url: `/injuries/${id}`,
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					[csrfHeader]: csrfToken
				},
				success: function(response) {
					console.log(`Injury ID ${id} 삭제 완료`);
					$(`input[value="${id}"]`).closest('tr').remove();
				},
				error: function(error) {
					console.error(`Injury ID ${id} 삭제 중 오류 발생:`, error);
				}
			});
		});

		// 삭제 후 모달 닫기
		const deleteConfirmModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
		deleteConfirmModal.hide();
	});


	// 검색 버튼 클릭 시 검색어에 맞는 데이터 필터링 및 페이지네이션 조정
	$('#searchButton').on('click', function() {
		let searchField = $('#searchField').val();
		let searchTerm = $('#searchInput').val().toLowerCase();

		let filteredData = injuryData.filter(function(injury) {
			let player = playerData.find(p => p.injuries.some(i => i.injuryIdx === injury.injuryIdx)) || {};

			if (searchField === 'name') {
				return player.personName && player.personName.toLowerCase().includes(searchTerm);
			}
			if (searchField === 'position') {
				return player.position && player.position.toLowerCase().includes(searchTerm);
			}
			return false;
		});

		// 필터링된 데이터를 페이징 처리하여 테이블과 페이지네이션을 다시 렌더링
		renderTableWithPagination(filteredData);
	});


	// 필터링된 데이터로 페이지네이션을 다시 생성하고 테이블에 렌더링하는 함수
	function renderTableWithPagination(filteredData) {
		let totalItems = filteredData.length;
		totalPages = Math.ceil(totalItems / pageSize);
		currentPage = 0;  // 필터링 후 첫 페이지로 초기화

		renderPaginationButtons();  // 페이지네이션 업데이트
		renderTable(filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize));  // 첫 페이지 데이터 렌더링
	}


	// 페이지 이동 버튼 클릭 시 이벤트 처리
	$(document).on('click', '.page-link', function() {
		currentPage = $(this).data('page');
		renderTable(injuryData.slice(currentPage * pageSize, (currentPage + 1) * pageSize));  // 페이지에 맞는 데이터 렌더링
	});

	// 부상 리스트에 데이터 불러오기 (Ajax 요청) - 페이징 처리
	function loadInjuryData(page = 0) {
		$.ajax({
			url: `/injuries?page=${page}&size=${pageSize}`,
			method: "GET",
			success: function(injuryDataResponse) {
				injuryData = injuryDataResponse.content;
				totalPages = injuryDataResponse.totalPages;

				$.ajax({
					url: "/injuries/players",
					method: "GET",
					success: function(data) {
						playerData = data;
						renderTable(injuryData);  // 부상 리스트 렌더링
						renderPaginationButtons();  // 페이지 버튼 렌더링
					},
					error: function(error) {
						console.error("선수 데이터를 가져오는 중 오류 발생:", error);
					}
				});
			},
			error: function(error) {
				console.error("부상 데이터를 가져오는 중 오류 발생:", error);
			}
		});
	}

	// 페이지 버튼 렌더링 함수
	function renderPaginationButtons() {
		let pageButtons = $('#pageButtons');
		pageButtons.empty();  // 기존 페이지 버튼 초기화

		// 이전 버튼 활성화/비활성화
		if (currentPage > 0) {
			$('#prevGroup').prop('disabled', false);
		} else {
			$('#prevGroup').prop('disabled', true);
		}

		// 다음 버튼 활성화/비활성화
		if (currentPage < totalPages - 1) {
			$('#nextGroup').prop('disabled', false);
		} else {
			$('#nextGroup').prop('disabled', true);
		}

		// 페이지 번호 버튼 렌더링
		for (let i = 0; i < totalPages; i++) {
			const pageButton = `<li class="page-item ${i === currentPage ? 'active' : ''}">
	                                <button class="page-link" data-page="${i}">${i + 1}</button>
	                            </li>`;
			pageButtons.append(pageButton);
		}
	}
	// 페이지 이동 버튼 클릭 시 이벤트 처리
	$(document).on('click', '.page-link', function() {
		currentPage = $(this).data('page');
		loadInjuryData(currentPage);
	});

	// 테이블에 데이터를 렌더링하는 함수
	function renderTable(data) {
		let injuryTableBody = $("#injuryTableBody");
		injuryTableBody.empty();  // 기존 데이터 초기화

		$.each(data, function(index, injury) {
			let player = playerData.find(p => p.injuries.some(i => i.injuryIdx === injury.injuryIdx)) || {};

			let backNumber = player.backNumber || '--';
			let personName = player.personName || '--';
			let brokenDate = injury.brokenDate ? new Date(injury.brokenDate).toLocaleString('ko-KR') : '--';

			let tableRow = `
				<tr style="cursor: pointer;" data-id="${player.personIdx || ''}">  <!-- 마우스 커서를 클릭하는 손 모양으로 변경 -->
					<td><input type="checkbox" class="rowCheckbox" value="${injury.injuryIdx}"></td>
					<td>${backNumber}</td>
					<td>${personName}</td>
					<td>${brokenDate}</td>
				</tr>`;
			injuryTableBody.append(tableRow);
		});
	}

	// 테이블 행 클릭 시, 해당 선수 정보와 부상 정보를 표시
	$('#injuryTableBody').on('click', 'tr', function() {
		let playerId = $(this).data('id');  // tr에 저장된 data-id 값 가져오기

		let player = playerData.find(p => p.personIdx == playerId);

		if (player) {
			$('#playerNumber').text(player.backNumber || '--');
			$('#playerName').text(player.personName || '--');
			$('#playerPosition').text(player.position || '--');
			$('#playerHeight').text(player.height ? player.height + 'cm' : '--');
			$('#playerWeight').text(player.weight ? player.weight + 'kg' : '--');

			if (player.injuries && player.injuries.length > 0) {
				let injury = player.injuries[0];
				$('#editInjuryPlayer').val(player.personName);
				$('#editInjuryDate').val(new Date(injury.brokenDate).toISOString().split('T')[0]);
				$('#editInjuryPart').val(injury.memo || '');
				$('input[name="editSeverity"][value="' + injury.severity + '"]').prop('checked', true);
				$('#editDoctor').val(injury.doctor || '');
				$('#editMemo').val(injury.memo || '');
				$('#editRecoveryPeriod').val(injury.recovery || 0);
				$('#injuryId').val(injury.injuryIdx);
			} else {
				alert("선수에게 부상 정보가 없습니다.");
			}
		} else {
			console.error("해당 선수 정보를 찾을 수 없습니다.");
		}
	});
	
	// 선수 목록을 가져와서 선택 필드에 추가하는 함수 (부상 추가용)
	function loadPlayerOptions() {
		$.ajax({
			url: '/injuries/players',
			method: 'GET',
			success: function(players) {
				let playerSelect = $('#addInjuryPlayer');
				playerSelect.empty();
				playerSelect.append('<option value="">선수명 선택</option>');

				// 선수 목록 추가
				$.each(players, function(index, player) {
					playerSelect.append(`<option value="${player.personIdx}">${player.personName}</option>`);
				});
			},
			error: function(error) {
				console.error('선수 목록을 불러오는 중 오류 발생:', error);
			}
		});
	}

	// 모달창 열 때 선수 목록 로드
	$('#openAddInjuryModalButton').on('click', function() {
		loadPlayerOptions();  // 선수 목록 로드

		// 모달창 열릴 때 입력 필드 초기화 (리셋)
		$('#addInjuryPlayer').val('');
		$('#addInjuryDate').val('');
		$('#addInjuryPart').val('');
		$('input[name="addSeverity"]').prop('checked', false);
		$('#addDoctor').val('');
		$('#addRecoveryPeriod').val('');
		$('#addMemo').val('');
	});

	// 부상 추가 버튼 클릭 시 POST 요청
	$('#addInjuryButton').on('click', function() {
		let playerId = $('#addInjuryPlayer').val();
		if (!playerId) {
			alert("선수를 선택해 주세요.");
			return;
		}

		let newInjury = {
			person: { personIdx: playerId },
			brokenDate: $('#addInjuryDate').val(),
			memo: $('#addInjuryPart').val(),
			severity: $('input[name="addSeverity"]:checked').val(),
			doctor: $('#addDoctor').val(),
			recovery: $('#addRecoveryPeriod').val(),
			note: $('#addMemo').val()
		};

		$.ajax({
			url: '/injuries',
			method: 'POST',
			contentType: 'application/json',
			headers: {
				'Content-Type': 'application/json',
				[csrfHeader]: csrfToken
			},
			data: JSON.stringify(newInjury),
			success: function(response) {
				// 부상 추가 성공 시 모달을 띄움
				const successModal = new bootstrap.Modal(document.getElementById('successModal'));
				successModal.show();

				$('#addInjuryModal').modal('hide');  // 부상 추가 모달 닫기
				loadInjuryData(currentPage);  // 추가 후 리스트 새로 로드

				// 부상 정보 추가 후 입력 필드 초기화 (리셋)
				$('#addInjuryPlayer').val('');
				$('#addInjuryDate').val('');
				$('#addInjuryPart').val('');
				$('input[name="addSeverity"]').prop('checked', false);
				$('#addDoctor').val('');
				$('#addRecoveryPeriod').val('');
				$('#addMemo').val('');
			},
			error: function(error) {
				console.error('부상 정보를 추가하는 중 오류 발생:', error);
				alert('부상 정보를 추가하는 중 오류가 발생했습니다.');
			}
		});
	});

	// 부상 정보 업데이트 (injury 테이블 업데이트 후 리스트 갱신)
	$('#updateInjuryButton').on('click', function() {
		let injuryIdx = $('#injuryId').val();
		let updatedInjury = {
			brokenDate: $('#editInjuryDate').val(),
			memo: $('#editMemo').val(),
			severity: $('input[name="editSeverity"]:checked').val(),
			doctor: $('#editDoctor').val(),
			recovery: $('#editRecoveryPeriod').val()
		};

		$.ajax({
			url: `/injuries/${injuryIdx}`,
			method: "PUT",
			contentType: "application/json",
			headers: {
				'Content-Type': 'application/json',
				[csrfHeader]: csrfToken
			},
			data: JSON.stringify(updatedInjury),
			success: function(response) {
				// 부상 정보가 성공적으로 수정되면 성공 모달을 표시
				const updateSuccessModal = new bootstrap.Modal(document.getElementById('updateSuccessModal'));
				updateSuccessModal.show();

				loadInjuryData(currentPage);  // 수정 후 리스트 새로 로드
			},
			error: function(error) {
				console.error("부상 정보를 수정하는 중 오류 발생:", error);
				alert('부상 정보 수정 중 오류가 발생했습니다.');
			}
		});
	});

	// 페이지 로드 시 데이터 불러오기
	loadInjuryData(currentPage);
});