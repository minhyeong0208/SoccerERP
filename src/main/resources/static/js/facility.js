document.addEventListener('DOMContentLoaded', function() {
	const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
	const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

	const searchLocationButton = document.getElementById('searchLocationButton');
	const facilityLocationInput = document.getElementById('facilityLocation');
	const mapContainer = document.getElementById('map');
	let map;
	let marker;
	let selectedLatitude;  // 위도 저장
	let selectedLongitude; // 경도 저장
	let locationSelected = false;  // 위치 선택 상태를 확인하기 위한 변수
	let deleteId;  // 삭제할 시설의 ID를 저장할 변수

	// 페이징 관련 변수
	let currentPage = 0; // 현재 페이지 (0부터 시작)
	let totalPages = 0;  // 전체 페이지 수

	// Kakao 지도 초기화 함수
	function initMap(lat = 33.450701, lng = 126.570667) {
		const mapOptions = {
			center: new kakao.maps.LatLng(lat, lng),
			level: 3
		};

		map = new kakao.maps.Map(mapContainer, mapOptions);

		// 기존 마커 제거
		if (marker) {
			marker.setMap(null);
		}

		marker = new kakao.maps.Marker({
			position: new kakao.maps.LatLng(lat, lng),
			map: map
		});
	}

	// 초기 지도 로드
	initMap();

	// 지도 이동 함수
	function moveMapToLocation(lat, lng) {
		const moveLatLng = new kakao.maps.LatLng(lat, lng);

		// 지도 중심 이동
		map.setCenter(moveLatLng);

		// 기존 마커 제거
		if (marker) {
			marker.setMap(null);
		}

		// 새로운 마커 추가
		marker = new kakao.maps.Marker({
			position: moveLatLng,
			map: map
		});
	}

	// 주소 검색 버튼 클릭 시 Kakao Postcode API를 사용하여 주소 검색 팝업을 띄움
	searchLocationButton.addEventListener('click', function() {
		new daum.Postcode({
			oncomplete: function(data) {
				// 주소 검색 후 선택된 주소를 시설 위치 입력란에 표시
				facilityLocationInput.value = data.address;

				// Kakao 지도 API를 사용하여 주소를 좌표로 변환
				const geocoder = new kakao.maps.services.Geocoder();
				geocoder.addressSearch(data.address, function(result, status) {
					if (status === kakao.maps.services.Status.OK) {
						const lat = result[0].y;
						const lng = result[0].x;

						// 위도와 경도를 저장
						selectedLatitude = lat;
						selectedLongitude = lng;

						// 지도와 마커 업데이트
						initMap(lat, lng);

						// 위치가 선택되었음을 표시
						locationSelected = true;
					} else {
						alert('위치 정보를 찾을 수 없습니다.');
					}
				});
			}
		}).open();
	});

	// 모달창 열릴 때 필드 초기화
	document.getElementById('openAddFacilityModalButton').addEventListener('click', function() {
		document.getElementById('facilityName').value = '';  // 시설명 초기화
		document.getElementById('facilityLocation').value = '';  // 시설 위치 초기화
		document.getElementById('facilityCapacity').value = '';  // 수용인원 초기화
		document.getElementById('facilityFoundDate').value = '';  // 준공일 초기화
		selectedLatitude = null;  // 선택된 위도 초기화
		selectedLongitude = null; // 선택된 경도 초기화
		locationSelected = false;  // 위치 선택 상태 초기화
	});

	// 시설 추가 기능
	document.getElementById('addFacilityButton').addEventListener('click', function() {
		// 위치가 선택되지 않았을 경우 경고
		if (!locationSelected) {
			alert('시설 위치를 검색하고 선택해야 합니다.');
			return;
		}

		const facilityData = {
			facilityName: document.getElementById('facilityName').value,
			facilityLocation: document.getElementById('facilityLocation').value,
			latitude: selectedLatitude,  // 선택된 위도 추가
			longitude: selectedLongitude, // 선택된 경도 추가
			capacity: document.getElementById('facilityCapacity').value,
			facilityFound: document.getElementById('facilityFoundDate').value
		};

		fetch('/facilities', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				[csrfHeader]: csrfToken  // CSRF 토큰과 헤더를 추가
			},
			body: JSON.stringify(facilityData)
		})
			.then(response => response.json())
			.then(data => {
				// alert('시설이 추가되었습니다.'); // 기존 alert는 제거

				// 시설 추가 성공 모달 표시
				const successModal = new bootstrap.Modal(document.getElementById('successModal'));
				successModal.show();  // 성공 모달 표시

				loadFacilityData(currentPage); // 테이블 갱신

				const modal = bootstrap.Modal.getInstance(document.getElementById('addFacilityModal'));
				modal.hide();  // 모달 닫기
			})
			.catch(error => {
				console.error('시설 추가 중 오류:', error);
			});
	});

	// 삭제 버튼 클릭 시 삭제할 시설의 ID를 저장하고, 삭제 확인 모달을 띄움
	document.getElementById('openDeleteButton').addEventListener('click', function() {
		const selectedIds = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
		if (selectedIds.length === 0) {
			alert('삭제할 시설을 선택하세요.');
			return;
		}

		deleteId = selectedIds;  // 선택된 항목의 ID를 저장
		const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
		deleteConfirmModal.show();  // 삭제 확인 모달 표시
	});

	// 삭제 모달의 "확인" 버튼 클릭 시 시설 삭제
	document.getElementById('confirmDeleteButton').addEventListener('click', function() {
		if (deleteId && deleteId.length > 0) {
			deleteId.forEach(id => {
				fetch(`/facilities/${id}`, {
					method: 'DELETE',
					headers: {
						[csrfHeader]: csrfToken  // CSRF 토큰과 헤더를 추가
					}
				})
					.then(response => {
						console.log(`시설 ID ${id} 삭제 완료`);
						loadFacilityData(currentPage);  // 테이블 갱신
					})
					.catch(error => {
						console.error(`시설 ID ${id} 삭제 중 오류 발생:`, error);
					});
			});
			const deleteConfirmModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
			deleteConfirmModal.hide();  // 삭제 후 모달 닫기
		}
	});

	// 삭제 모달의 "취소" 버튼 클릭 시 모달 닫기
	document.getElementById('cancelDeleteButton').addEventListener('click', function() {
		const deleteConfirmModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
		deleteConfirmModal.hide();  // 모달 닫기
	});


	// 시설 리스트 데이터 불러오기
	function loadFacilityData(page) {
		fetch(`/facilities?page=${page}&size=10`) // 페이지와 크기 파라미터 추가
			.then(response => response.json())
			.then(data => {
				const facilityTableBody = document.getElementById('facilityTableBody');
				facilityTableBody.innerHTML = ''; // 기존 데이터 초기화

				const facilities = Array.isArray(data.content) ? data.content : [];

				if (facilities.length > 0) {
					facilities.forEach(facility => {
						const foundDate = facility.facilityFound ? new Date(facility.facilityFound).toISOString().split('T')[0] : 'N/A';

						const row = `<tr data-lat="${facility.latitude}" data-lng="${facility.longitude}">
	                                    <td><input type="checkbox" value="${facility.facilityIdx}"></td>
	                                    <td>${facility.facilityName !== null ? facility.facilityName : 'N/A'}</td>
	                                    <td>${facility.facilityLocation !== null ? facility.facilityLocation : 'N/A'}</td>
	                                    <td>${facility.capacity !== null ? facility.capacity : 'N/A'}</td>
	                                    <td>${foundDate}</td> <!-- 날짜 형식 수정 -->
	                                </tr>`;
						facilityTableBody.insertAdjacentHTML('beforeend', row);
					});

					// 페이지 정보 업데이트
					totalPages = data.totalPages;
					renderPaginationButtons();

					// 행을 클릭했을 때 지도를 이동시키는 이벤트 처리
					document.querySelectorAll('#facilityTableBody tr').forEach(row => {
						// 마우스 커서를 클릭하는 포인터로 변경
						row.style.cursor = 'pointer';

						row.addEventListener('click', function() {
							const lat = this.getAttribute('data-lat');
							const lng = this.getAttribute('data-lng');

							// 위도와 경도가 있을 경우에만 지도 이동
							if (lat && lng) {
								moveMapToLocation(parseFloat(lat), parseFloat(lng));
							} else {
								alert('이 시설의 위치 정보가 없습니다.');
							}
						});

						// 마우스를 가져다 대면 행의 배경색을 변경
						row.addEventListener('mouseenter', function() {
							row.style.backgroundColor = '#f0f0f0'; // 마우스가 행 위에 있을 때 색상 변경
						});

						// 마우스가 떠나면 원래 배경색으로 돌아감
						row.addEventListener('mouseleave', function() {
							row.style.backgroundColor = ''; // 배경색 초기화
						});
					});
				} else {
					console.error('서버로부터 올바르지 않은 데이터 형식이 반환되었습니다.');
				}
			})
			.catch(error => {
				console.error('시설 데이터를 불러오는 중 오류 발생:', error);
			});
	}

	// 페이지 버튼 렌더링 함수
	function renderPaginationButtons() {
		let pageButtons = $('#pageButtons');
		pageButtons.empty();  // 기존 페이지 버튼 초기화

		// 페이지 정보 추가 (현재 페이지 + 1, 전체 페이지 수)
		const pageInfo = `<li class="page-item disabled">
                          </li>`;
		pageButtons.append(pageInfo);

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
		loadFacilityData(currentPage);  // 해당 페이지의 데이터 다시 불러오기
	});

	// 이전 페이지로 이동
	$('#prevGroup').on('click', function() {
		if (currentPage > 0) {
			currentPage--;
			loadFacilityData(currentPage);  // 이전 페이지의 데이터 불러오기
		}
	});

	// 다음 페이지로 이동
	$('#nextGroup').on('click', function() {
		if (currentPage < totalPages - 1) {
			currentPage++;
			loadFacilityData(currentPage);  // 다음 페이지의 데이터 불러오기
		}
	});

	// 페이지 로드 시 시설 리스트 불러오기
	loadFacilityData(currentPage);

	// 검색 기능
	document.getElementById('searchButton').addEventListener('click', function() {
		const searchField = document.getElementById('searchField').value;  // 검색 필드: 시설명, 위치 등
		const searchTerm = document.getElementById('searchInput').value.toLowerCase();  // 검색어를 소문자로 변환

		// 검색 요청
		fetch(`/facilities/search?${searchField}=${encodeURIComponent(searchTerm)}`)
			.then(response => response.json())
			.then(data => {
				const facilityTableBody = document.getElementById('facilityTableBody');
				facilityTableBody.innerHTML = ''; // 기존 데이터 초기화

				// 서버로부터 반환된 데이터가 배열인지 확인
				if (Array.isArray(data)) {
					if (data.length === 0) {
						facilityTableBody.innerHTML = '<tr><td colspan="5">검색 결과가 없습니다.</td></tr>';
					} else {
						data.forEach(facility => {
							const foundDate = facility.facilityFound ? new Date(facility.facilityFound).toISOString().split('T')[0] : 'N/A';
							const row = `<tr>
	                                        <td><input type="checkbox" value="${facility.facilityIdx}"></td>
	                                        <td>${facility.facilityName}</td>
	                                        <td>${facility.facilityLocation}</td>
	                                        <td>${facility.capacity}</td>
	                                        <td>${foundDate}</td> <!-- 날짜 형식 수정 -->
	                                     </tr>`;
							facilityTableBody.insertAdjacentHTML('beforeend', row);
						});
					}
				} else {
					console.error('검색 결과가 배열이 아닙니다.');
				}
			})
			.catch(error => {
				console.error('검색 중 오류 발생:', error);
			});
	});


});
