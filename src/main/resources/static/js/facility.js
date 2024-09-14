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
	// Update시 사용되는 전역변수들
	let selectedFacilityId; // 선택된 시설의 ID를 저장할 변수
	// 페이징 관련 변수
	let currentPage = 0; // 현재 페이지 (0부터 시작)
	let totalPages = 0;  // 전체 페이지 수
	let isSearching = false;  // 검색 상태를 나타내는 변수
	let searchCurrentPage = 0; // 검색 시 현재 페이지
	let searchTotalPages = 0; // 검색 결과의 총 페이지 수


	// 수정 버튼 클릭 시 수정 모달을 열고 선택된 시설 정보를 로드하는 함수
	function openEditModal(facilityId) {
		// console.log(`Fetching facility with ID: ${facilityId}`);  // 요청하는 시설 ID를 출력
		selectedFacilityId = facilityId;  // 선택된 시설의 ID 저장

		fetch(`/facilities/${facilityId}`)
			.then(response => {
				console.log('Fetch response:', response);  // 응답 객체 출력
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				return response.json();  // 응답 본문을 JSON으로 파싱
			})
			.then(facility => {
				console.log('Facility data:', facility);  // 시설 데이터 출력

				// 시설 정보를 폼에 채워 넣기
				document.getElementById('editFacilityName').value = facility.facilityName || '';
				document.getElementById('editFacilityLocation').value = facility.facilityLocation || '';
				document.getElementById('editFacilityCapacity').value = facility.capacity || '';
				document.getElementById('editFacilityFoundDate').value = facility.facilityFound
					? new Date(facility.facilityFound).toISOString().split('T')[0]
					: '';

				// 지도 및 마커 초기화 (필요한 경우)
				// initEditMap(facility.latitude, facility.longitude);

				// 오류 메시지를 설정
				document.getElementById('errorMessage').textContent = '시설 정보를 불러오는 중 오류가 발생했습니다.';

				// 수정 모달 열기
				const editModal = new bootstrap.Modal(document.getElementById('updateFacilityModal'));
				editModal.show();
			})
			.catch(error => {
				console.error('Error fetching facility data:', error);  // 오류 메시지 출력
				// alert('시설 정보를 불러오는 중 오류가 발생했습니다.');  // 사용자에게 오류 알림
				// 모달 창 열기
				const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
				errorModal.show();
			});
	}

	// 검색 결과에 맞는 페이징 버튼 렌더링 함수
	function renderSearchPaginationButtons() {
		const pageButtons = $('#pageButtons');
		pageButtons.empty();

		for (let i = 0; i < searchTotalPages; i++) {
			const pageButton = `<li class="page-item ${i === searchCurrentPage ? 'active' : ''}">
	                               <button class="page-link search-page-link" data-page="${i}">${i + 1}</button>
	                           </li>`;
			pageButtons.append(pageButton);
		}
	}

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
						// 오류 메시지를 설정
						document.getElementById('errorMessage').textContent = '위치 정보를 찾을 수 없습니다.';

						// 오류 모달 창 열기
						const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
						errorModal.show();
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
			// 모달 창 열기
			const locationModal = new bootstrap.Modal(document.getElementById('locationRequiredModal'));
			locationModal.show();
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

	// 수정 모달의 "수정" 버튼 클릭 시 시설 정보 업데이트
	document.getElementById('editFacilityButton').addEventListener('click', function() {
		// 수정된 시설 정보를 수집
		const updatedFacilityData = {
			facilityName: document.getElementById('editFacilityName').value,
			facilityLocation: document.getElementById('editFacilityLocation').value,
			capacity: document.getElementById('editFacilityCapacity').value,
			facilityFound: document.getElementById('editFacilityFoundDate').value,
			//위도(latitude), 경도(longitude)도 추가
			latitude: selectedLatitude,
			longitude: selectedLongitude
		};

		// 서버로 PUT 요청 보내기
		fetch(`/facilities/${selectedFacilityId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				[csrfHeader]: csrfToken  // CSRF 토큰 추가
			},
			body: JSON.stringify(updatedFacilityData)
		})
			.then(response => {
				if (response.ok) {
					// 업데이트 성공 !
					// 시설 리스트 갱신
					loadFacilityData(currentPage);

					// 모달 닫기
					const editModal = bootstrap.Modal.getInstance(document.getElementById('updateFacilityModal'));
					editModal.hide();

					// 성공 모달 표시
					const successModal = new bootstrap.Modal(document.getElementById('successModal'));
					document.getElementById('successMessage').textContent = '시설 정보가 수정되었습니다.';
					successModal.show();

				} else {
					// 오류 처리
					// 오류 메시지를 설정
					document.getElementById('errorMessage').textContent = '시설 정보 수정에 실패하였습니다.';
					// 오류 모달 창 열기
					const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
					errorModal.show();
				}
			})
			.catch(error => {
				console.error('시설 정보 수정 중 오류 발생:', error);
				// 오류 메시지를 설정
				document.getElementById('errorMessage').textContent = '시설 정보 수정 중 오류가 발생했습니다.';
				// 오류 모달 창 열기
				const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
				errorModal.show();
			});
	});

	// 위치 검색 버튼 클릭 시 이벤트 핸들러 (수정 모달)
	document.getElementById('searchEditLocationButton').addEventListener('click', function() {
		new daum.Postcode({
			oncomplete: function(data) {
				document.getElementById('editFacilityLocation').value = data.address;
				const geocoder = new kakao.maps.services.Geocoder();
				geocoder.addressSearch(data.address, function(result, status) {
					if (status === kakao.maps.services.Status.OK) {
						selectedLatitude = result[0].y;
						selectedLongitude = result[0].x;
					} else {
						// 오류 메시지를 모달로 표시
						showError('위치 정보를 찾을 수 없습니다.');
					}
				});
			}
		}).open();
	});

	// 삭제 버튼 클릭 시 삭제할 시설의 ID를 저장하고, 삭제 확인 모달을 띄움
	document.getElementById('openDeleteButton').addEventListener('click', function() {
		const selectedIds = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
		if (selectedIds.length === 0) {
			// 오류 메시지를 모달로 표시
			showError('삭제할 시설을 선택하세요');
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

	// 수정 모달이 열리는 조건
	document.getElementById('openUpdateFacilityModalButton').addEventListener('click', function() {
		const checkboxes = document.querySelectorAll('#facilityTableBody input[type="checkbox"]:checked');

		// 1. 선택된 체크박스가 1개인지 확인
		if (checkboxes.length !== 1) {
			// 오류 메시지를 모달로 표시
			showError('수정할 항목을 하나만 선택하세요.');
			return;  // 체크박스가 1개가 아니면 함수 종료 (모달 열리지 않음)
		}

		// 2. 선택된 시설의 ID 가져오기
		const facilityId = checkboxes[0].value;

		// 3. 선택된 시설 정보를 로드하고 모달창 열기
		openEditModal(facilityId);
	});


	// 시설 리스트 데이터 불러오기
	function loadFacilityData(searchField, searchTerm, page) {
	    let url;

	    // 검색 상태일 때 URL과 기본 데이터 로드 URL을 구분
	    if (isSearching && searchField && searchTerm) {
	        url = `/facilities/search?${searchField}=${encodeURIComponent(searchTerm)}&page=${page}&size=10`;
	    } else {
	        url = `/facilities?page=${page}&size=10`;
	    }

	    fetch(url)
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
	                                    <td>${foundDate}</td>
	                                </tr>`;
	                    facilityTableBody.insertAdjacentHTML('beforeend', row);
	                });

	                // 페이지 정보 업데이트
	                totalPages = data.totalPages;
	                renderPaginationButtons(totalPages, page, isSearching);

	                // 행을 클릭했을 때 지도를 이동시키는 이벤트 처리
	                document.querySelectorAll('#facilityTableBody tr').forEach(row => {
	                    row.style.cursor = 'pointer';

	                    row.addEventListener('click', function() {
	                        const lat = parseFloat(this.getAttribute('data-lat'));
	                        const lng = parseFloat(this.getAttribute('data-lng'));

	                        // 위도와 경도가 있을 경우에만 지도 이동
	                        if (!isNaN(lat) && !isNaN(lng)) {
	                            moveMapToLocation(lat, lng);
	                        } else {
	                            showError('이 시설의 위치 정보가 없습니다.');
	                        }
	                    });

	                    row.addEventListener('mouseenter', function() {
	                        row.style.backgroundColor = '#f0f0f0'; // 마우스가 행 위에 있을 때 색상 변경
	                    });

	                    row.addEventListener('mouseleave', function() {
	                        row.style.backgroundColor = ''; // 배경색 초기화
	                    });
	                });
	            } else {
	                facilityTableBody.innerHTML = '<tr><td colspan="5">검색 결과가 없습니다.</td></tr>';
	            }
	        })
	        .catch(error => {
	            console.error('시설 데이터를 불러오는 중 오류 발생:', error);
	        });
	}

	// 오류 메시지 표시 함수
	function showError(message) {
		document.getElementById('errorMessage').textContent = message;
		const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
		errorModal.show();
	}

	// 페이징 버튼 렌더링 함수 (검색 및 기본 상태 모두 대응)
	function renderPaginationButtons(totalPages, currentPage, isSearch) {
		const pageButtons = $('#pageButtons');
		pageButtons.empty();

		for (let i = 0; i < totalPages; i++) {
			const pageButton = `<li class="page-item ${i === currentPage ? 'active' : ''}">
	                               <button class="page-link" data-page="${i}" data-search="${isSearch}">${i + 1}</button>
	                           </li>`;
			pageButtons.append(pageButton);
		}
	}

	// 페이지 버튼 클릭 시 처리
	$(document).on('click', '.page-link', function() {
		const page = $(this).data('page');
		const isSearch = $(this).data('search');
		if (isSearch) {
			searchCurrentPage = page;
			const searchTerm = document.getElementById('searchInput').value.trim();
			loadFacilityData('facilityName', searchTerm, searchCurrentPage);
		} else {
			currentPage = page;
			loadFacilityData(null, '', currentPage);
		}
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
		const searchTerm = document.getElementById('searchInput').value.trim();

		if (!searchTerm) {
			showError('검색어를 입력해주세요.');
			return;
		}

		// 검색 상태로 전환
		isSearching = true;
		searchCurrentPage = 0;

		// 검색 결과 로드 함수 호출
		loadFacilityData('facilityName', searchTerm, searchCurrentPage);
	});

	// 초기 데이터 로드 (기본 상태)
	loadFacilityData(null, '', currentPage);

});