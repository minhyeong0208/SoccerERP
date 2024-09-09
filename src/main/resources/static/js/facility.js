$(document).ready(function () {
    let currentPage = 0;  // 현재 페이지
    const pageSize = 10;  // 한 페이지에 보여줄 데이터 수
    let totalPages = 0;   // 전체 페이지 수
    let isSearchMode = false;  // 검색 모드인지 여부
    let searchQuery = '';  // 검색어 저장

    // 시설 리스트 가져오기 (페이징 처리)
    function loadFacilityData(page = 0) {
        const url = isSearchMode 
            ? `/facilities/search?facilityName=${encodeURIComponent(searchQuery)}`
            : `/facilities?page=${page}&size=${pageSize}`;

        $.ajax({
            url: url,
            method: "GET",
            success: function (data) {
                if (isSearchMode) {
                    // 검색 모드일 때는 페이지네이션 없이 전체 데이터를 렌더링
                    renderTable(data);
                } else {
                    totalPages = data.totalPages;  // 전체 페이지 수 설정
                    renderTable(data.content);  // 테이블에 데이터 렌더링
                    renderPaginationButtons();  // 페이지 버튼 렌더링
                }
            },
            error: function (error) {
                console.error("시설 데이터를 가져오는 중 오류 발생:", error);
            }
        });
    }

    // 테이블에 데이터를 렌더링하는 함수
    function renderTable(data) {
        let facilityTableBody = $("#facilityTableBody");
        facilityTableBody.empty();  // 기존 데이터 초기화

        $.each(data, function (index, facility) {
            let facilityRow = `
                <tr>
                    <td><input type="checkbox" class="rowCheckbox" value="${facility.facilityIdx}"></td>
                    <td>${facility.facilityName || '--'}</td>
                    <td>${facility.latitude || '--'}</td>
                    <td>${facility.longitude || '--'}</td>
                    <td>${facility.capacity || '--'}</td>
                    <td>${facility.facilityFound ? new Date(facility.facilityFound).getFullYear() : '--'}</td>
                </tr>`;
            facilityTableBody.append(facilityRow);
        });
    }

    // 페이지 버튼 렌더링 함수
    function renderPaginationButtons() {
        let pageButtons = $('#pageButtons');
        pageButtons.empty();  // 기존 페이지 버튼 초기화

        for (let i = 0; i < totalPages; i++) {
            const pageButton = `<li class="page-item ${i === currentPage ? 'active' : ''}">
                                    <button class="page-link" data-page="${i}">${i + 1}</button>
                                </li>`;
            pageButtons.append(pageButton);
        }

        // 이전, 다음 버튼 활성화/비활성화
        $('#prevGroup').prop('disabled', currentPage === 0);
        $('#nextGroup').prop('disabled', currentPage === totalPages - 1);
    }

    // 페이지 이동 버튼 클릭 시 데이터 로드
    $(document).on('click', '.page-link', function () {
        currentPage = $(this).data('page');
        loadFacilityData(currentPage);
    });

    // 검색 버튼 클릭 시
    $('#searchButton').on('click', function () {
        searchQuery = $('#searchInput').val().toLowerCase();
        if (searchQuery) {
            isSearchMode = true;  // 검색 모드로 변경
            loadFacilityData(0);  // 검색 결과 로드
        } else {
            isSearchMode = false;  // 검색 모드 해제
            loadFacilityData(currentPage);  // 전체 목록 로드
        }
    });

    // 초기 데이터 로드
    loadFacilityData(currentPage);
});
