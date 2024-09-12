$(document).ready(function() {
    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

    let transferData = [];
    let currentPage = 0;
    const pageSize = 20;
    let totalPages = 0;
    let selectedIds = [];

    // 숫자에 콤마 추가하는 함수
    function addCommas(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // 콤마가 있는 문자열에서 숫자만 추출하는 함수
    function removeCommas(str) {
        return str.replace(/,/g, '');
    }

    // 이적료 입력 필드에 콤마 추가 이벤트 리스너
    $('#editPrice').on('input', function() {
        let value = removeCommas($(this).val());
        if (value !== '') {
            value = parseInt(value, 10);
            if (!isNaN(value)) {
                $(this).val(addCommas(value));
            }
        }
    });

    // 전체 선택 체크박스 이벤트
    $('#selectAllCheckbox').on('click', function() {
        $('.rowCheckbox').prop('checked', $(this).is(':checked'));
    });

    // 개별 체크박스 이벤트
    $('#transferTableBody').on('change', '.rowCheckbox', function() {
        $('#selectAllCheckbox').prop('checked', $('.rowCheckbox:checked').length === $('.rowCheckbox').length);
    });

    // 삭제 버튼 클릭 이벤트
    $('#openDeleteButton').on('click', function() {
        selectedIds = $('.rowCheckbox:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedIds.length === 0) {
            alert("삭제할 항목을 선택하세요.");
            return;
        }

        $('#deleteConfirmModal').modal('show');
    });

    // 삭제 확인 이벤트
    $('#confirmDeleteButton').on('click', function() {
        $.ajax({
            url: '/transfers/delete-multiple',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            data: JSON.stringify(selectedIds),
            success: function() {
                $('#deleteConfirmModal').modal('hide');
                loadTransferData(currentPage);
            },
            error: function(error) {
                console.error('이적 정보 삭제 중 오류 발생:', error);
                alert('이적 정보 삭제 중 오류가 발생했습니다.');
            }
        });
    });

    // 검색 기능
    $('#searchButton').on('click', function() {
        let searchField = $('#searchField').val();
        let searchTerm = $('#searchInput').val().toLowerCase();

        $.ajax({
            url: `/transfers/search?${searchField}=${searchTerm}&page=0&size=${pageSize}`,
            method: 'GET',
            success: function(data) {
                transferData = data.content;
                totalPages = data.totalPages;
                currentPage = 0;
                renderTable(transferData);
                renderPaginationButtons();
            },
            error: function(error) {
                console.error('검색 중 오류 발생:', error);
                alert('검색 중 오류가 발생했습니다.');
            }
        });
    });

    // 페이지네이션 이벤트
    $(document).on('click', '.page-link', function() {
        currentPage = $(this).data('page');
        loadTransferData(currentPage);
    });

    // 이적 데이터 로드 함수
    function loadTransferData(page = 0) {
        $.ajax({
            url: `/transfers?page=${page}&size=${pageSize}`,
            method: "GET",
            success: function(response) {
                transferData = response.content;
                totalPages = response.totalPages;
                renderTable(transferData);
                renderPaginationButtons();
            },
            error: function(error) {
                console.error("이적 데이터를 가져오는 중 오류 발생:", error);
            }
        });
    }

    // 페이지네이션 버튼 렌더링
    function renderPaginationButtons() {
        let pageButtons = $('#pageButtons');
        pageButtons.empty();

        $('#prevGroup').prop('disabled', currentPage === 0);
        $('#nextGroup').prop('disabled', currentPage >= totalPages - 1);

        for (let i = 0; i < totalPages; i++) {
            pageButtons.append(`
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <button class="page-link" data-page="${i}">${i + 1}</button>
                </li>
            `);
        }
    }

    // 테이블 렌더링
    function renderTable(data) {
        let transferTableBody = $("#transferTableBody");
        transferTableBody.empty();

        $.each(data, function(index, transfer) {
            transferTableBody.append(`
            <tr style="cursor: pointer;" data-id="${transfer.transferIdx}">
                <td><input type="checkbox" class="rowCheckbox" value="${transfer.transferIdx}"></td>
                <td>${transfer.transferType === 1 ? '구매' : '판매'}</td>
                <td>${transfer.person ? transfer.person.personName : '--'}</td>
                <td>${transfer.opponent || '--'}</td>
                <td>${new Date(transfer.tradingDate).toLocaleDateString()}</td>
                <td>${new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(transfer.price)}</td>
            </tr>
        `);
        });
    }

    // 선수 이미지 로드
    function loadPlayerImage(playerName) {
        let imagePath = `/img/persons/${playerName}.png`;
        let playerImage = document.getElementById('playerImage');
        playerImage.src = imagePath;
        playerImage.onerror = function() {
            this.onerror = null;
            this.src = '/img/persons/default.png';
        };
    }

    // 테이블 행 클릭 이벤트
    $('#transferTableBody').on('click', 'tr', function() {
        let transferId = $(this).data('id');
        let transfer = transferData.find(t => t.transferIdx == transferId);

        if (transfer) {
            $('#playerNumber').text(transfer.person ? transfer.person.backNumber : '--');
            $('#playerName').text(transfer.person ? transfer.person.personName : '--');
            $('#playerPosition').text(transfer.person ? transfer.person.position : '--');
            $('#playerHeight').text(transfer.person ? transfer.person.height + 'cm' : '--');
            $('#playerWeight').text(transfer.person ? transfer.person.weight + 'kg' : '--');

            loadPlayerImage(transfer.person ? transfer.person.personName : 'default');

            $('#editTransferPlayer').val(transfer.person ? transfer.person.personName : '');
            $('#editTransferDate').val(new Date(transfer.tradingDate).toISOString().split('T')[0]);
            $('#editTransferType').val(transfer.transferType);
            $('#editOpponent').val(transfer.opponent);
            $('#editPrice').val(addCommas(transfer.price));
            $('#editTransferMemo').val(transfer.transferMemo);
            $('#transferId').val(transfer.transferIdx);
        }
    });

    // 이적 추가 모달 오픈 이벤트
    $('#openAddTransferModalButton').on('click', function() {
        loadPlayerOptions();
        loadTeamOptions();
        resetAddTransferForm();
    });

    // 이적 추가 이벤트
    $('#addTransferButton').on('click', function() {
        let newTransfer = {
            person: { personIdx: $('#addTransferPlayer').val() },
            transferType: $('#addTransferType').val(),
            tradingDate: $('#addTransferDate').val(),
            opponent: $('#addOpponent').val(),
            price: removeCommas($('#addPrice').val()),
            transferMemo: $('#addTransferMemo').val()
        };

        $.ajax({
            url: '/transfers',
            method: 'POST',
            contentType: 'application/json',
            headers: {
                [csrfHeader]: csrfToken
            },
            data: JSON.stringify(newTransfer),
            success: function() {
                $('#addTransferModal').modal('hide');
                $('#successModal').modal('show');
                loadTransferData(currentPage);
                resetAddTransferForm();
            },
            error: function(error) {
                console.error('이적 정보 추가 중 오류 발생:', error);
                alert('이적 정보 추가 중 오류가 발생했습니다.');
            }
        });
    });

    // 이적 정보 업데이트 이벤트
    $('#updateTransferButton').on('click', function() {
        let transferIdx = $('#transferId').val();
        let updatedTransfer = {
            transferType: $('#editTransferType').val(),
            tradingDate: $('#editTransferDate').val(),
            opponent: $('#editOpponent').val(),
            price: removeCommas($('#editPrice').val()),
            transferMemo: $('#editTransferMemo').val()
        };

        $.ajax({
            url: `/transfers/${transferIdx}`,
            method: "PUT",
            contentType: "application/json",
            headers: {
                [csrfHeader]: csrfToken
            },
            data: JSON.stringify(updatedTransfer),
            success: function() {
                $('#updateSuccessModal').modal('show');
                loadTransferData(currentPage);
            },
            error: function(error) {
                console.error("이적 정보 수정 중 오류 발생:", error);
                alert('이적 정보 수정 중 오류가 발생했습니다.');
            }
        });
    });

    // 선수 옵션 로드
    function loadPlayerOptions() {
        $.ajax({
            url: '/players',
            method: 'GET',
            success: function(players) {
                let playerSelect = $('#addTransferPlayer');
                playerSelect.empty().append('<option value="">선수명 선택</option>');
                players.forEach(player => {
                    playerSelect.append(`<option value="${player.personIdx}">${player.personName}</option>`);
                });
            },
            error: function(error) {
                console.error('선수 목록 로드 중 오류 발생:', error);
            }
        });
    }

    // 팀 옵션 로드
    function loadTeamOptions() {
        $.ajax({
            url: '/teams',
            method: 'GET',
            success: function(teams) {
                let teamSelect = $('#addOpponent');
                teamSelect.empty().append('<option value="">상대팀 선택</option>');
                teams.forEach(team => {
                    teamSelect.append(`<option value="${team.teamName}">${team.teamName}</option>`);
                });
            },
            error: function(error) {
                console.error('팀 목록 로드 중 오류 발생:', error);
            }
        });
    }

    // 이적 추가 폼 초기화
    function resetAddTransferForm() {
        $('#addTransferPlayer').val('');
        $('#addTransferDate').val('');
        $('#addTransferType').val('');
        $('#addOpponent').val('');
        $('#addPrice').val('');
        $('#addTransferMemo').val('');
    }

    // 파일 업로드 처리
    $('#addPlayerImage').on('change', function(event) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('#playerImagePreview').attr('src', e.target.result);
            }
            reader.readAsDataURL(file);
        }
    });

// FormData 객체 사용하여 파일 업로드
    $('#confirmAdditionalInfoButton').on('click', function() {
        var formData = new FormData();

        var transferData = {
            // ... 기존 transfer 데이터 ...
        };
        formData.append('transfer', new Blob([JSON.stringify(transferData)], {type: "application/json"}));

        var personData = {
            // ... 기존 person 데이터 ...
        };
        formData.append('person', new Blob([JSON.stringify(personData)], {type: "application/json"}));

        var fileInput = $('#addPlayerImage')[0];
        if (fileInput.files[0]) {
            formData.append('file', fileInput.files[0]);
        }

        $.ajax({
            url: '/transfers/purchase',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                // ... 성공 처리 ...
            },
            error: function(xhr, status, error) {
                // ... 에러 처리 ...
            }
        });
    });

    // 초기 데이터 로드 호출
    loadTransferData(currentPage);
});