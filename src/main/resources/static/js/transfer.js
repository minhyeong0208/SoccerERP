$(document).ready(function() {
    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

    let transferData = [];
    let currentPage = 0;
    let transferType = '';
    let filterType = 'person'; // enum [person, team] || default person
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
    $('#editPrice, #addPrice, #addSellPrice').on('input', function() {
        let value = removeCommas($(this).val());
        if (value !== '') {
            value = parseInt(value, 10);
            if (!isNaN(value)) {
                $(this).val(addCommas(value));
            }
        }
    });

    // 이적 유형 필터 이벤트 리스너
    document.querySelectorAll('input[name="transferTypeFilter"]').forEach(radio => {
        radio.addEventListener('change', function() {
            transferType = this.value === '전체' ? '' : this.value;
            currentPage = 0;
            loadTransfer(currentPage);
        });
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
                loadTransfer(currentPage);
            },
            error: function(error) {
                console.error('이적 정보 삭제 중 오류 발생:', error);
                alert('이적 정보 삭제 중 오류가 발생했습니다.');
            }
        });
    });

    // searchField 변경 이벤트 리스너
    $('#searchField').on('change', function() {
        filterType = $(this).val();

        // 검색 입력 필드의 placeholder 갱신
        $('#searchInput').attr('placeholder', filterType === 'person' ? '선수명 입력' : '팀명 입력');
    });

    // searchInput에서 엔터 키 입력 이벤트 리스너
    $('#searchInput').on('keypress', function(e) {
        if (e.which === 13) { // 13은 엔터 키의 keyCode
            console.log('# searchInput > enter key pressed');
            search();
            e.preventDefault(); // 폼 제출 방지
        }
    });

    // 검색 기능
    $('#searchButton').on('click', function() {
        console.log('# searchButton > click')
        search();
    });

    function search() {
        let searchField = $('#searchField').val();
        let searchTerm = $('#searchInput').val().toLowerCase();

        const url = `/transfers/search?${searchField}=${searchTerm}&page=0&size=${pageSize}&filterType=${filterType}`
            + (transferType !== '' ? `&transferType=` + transferType : '');

        $.ajax({
            url: url,
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
    }

    // 페이지네이션 이벤트
    $(document).on('click', '.page-link', function() {
        currentPage = $(this).data('page');
        loadTransfer(currentPage);
    });

    // 이적 데이터 로드 함수
    function loadTransfer(page = 0) {
        const url = `/transfers?page=${page}&size=${pageSize}`
            + (transferType !== '' ? `&transferType=` + transferType : '');
        $.ajax({
            url: url,
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

            // 날짜 처리 수정
            let date = new Date(transfer.tradingDate);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            $('#editTransferDate').val(date.toISOString().split('T')[0]);

            $('#editTransferType').val(transfer.transferType);
            $('#editOpponent').val(transfer.opponent);
            $('#editPrice').val(addCommas(transfer.price));
            $('#editTransferMemo').val(transfer.transferMemo);
            $('#transferId').val(transfer.transferIdx);
        }
    });

    // 이적 추가 모달 오픈 이벤트
    $('#openAddTransferModalButton').on('click', function() {
        loadTeamOptions();
        // loadPlayerOptions();
        // resetAddTransferForm();
        const selectedValue = $('input[name="transferType"]:checked').val();
        switchFormMode(selectedValue);
        updatePlayerNameField(selectedValue);
    });

    function switchFormMode(selectedValue) {
        var addForm1 = $('#addForm1');
        var addForm2 = $('#addForm2');
        var nextInfoButton = $('#nextInfoButton');
        var backInfoButton = $('#backInfoButton');
        var saveButton = $('#saveButton');

        switch(selectedValue) {
            case 'buy':
                console.log('구매가 선택되었습니다.');
                addForm1.show();
                addForm2.hide();
                nextInfoButton.show();
                backInfoButton.hide();
                saveButton.hide();
                break;
            case 'sell':
                console.log('판매가 선택되었습니다.');
                addForm1.show();
                addForm2.hide();
                nextInfoButton.hide();
                backInfoButton.hide();
                saveButton.show();
                break;
            case 'next':
                console.log('선수 추가 정보 버튼 클릭 (다음 버튼)');
                addForm1.hide();
                addForm2.show();
                nextInfoButton.hide();
                backInfoButton.show();
                saveButton.show();
                break;
            case 'back':
                console.log('선수 추가 정보 버튼 클릭 (이전 버튼)');
                addForm1.show();
                addForm2.hide();
                nextInfoButton.show();
                backInfoButton.hide();
                saveButton.hide();
                break;
            default:
                console.log('알 수 없는 값입니다.');
        }
    }

    function fetchAndPopulatePlayerList(selectElement) {
        $.ajax({
            url: '/transfers/person/list',
            method: 'GET',
            success: function(response) {
                selectElement.html('<option value="">선수를 선택하세요</option>');
                $.each(response, function(personIdx, personName) {
                    selectElement.append($('<option>', {
                        value: personIdx,
                        text: personName
                    }));
                });
            },
            error: function(error) {
                console.error('Error fetching player list:', error);
            }
        });
    }

    function updatePlayerNameField(transferType) {
        var container = $('#playerNameContainer');
        container.empty(); // 기존 내용을 비웁니다

        if (transferType === 'buy') {
            // 구매의 경우: text input 생성
            container.html('<input type="text" class="form-control" id="addPlayerName" autocomplete="off">');
        } else if (transferType === 'sell') {
            // 판매의 경우: select (콤보박스) 생성 및 데이터 로드
            var select = $('<select class="form-control" id="addPlayerName"></select>');
            container.append(select);
            fetchAndPopulatePlayerList(select);
        }
    }

    // 이적 타입 변경 이벤트
    $('input[name="transferType"]').on('change', function() {
        var selectedValue = $(this).val();
        console.log('Selected transfer type:', selectedValue);
        switchFormMode(selectedValue);
        updatePlayerNameField(selectedValue);
    });

    function validationForm1() {
        const requiredFields = ['addPlayerName', 'addTransferDate', 'addPrice', 'addOpponent'];
        let isValid = true;
        let firstInvalidField = null;

        // 각 필수 필드 검사
        requiredFields.forEach(fieldId => {
            const field = $(`#${fieldId}`);
            const value = field.val().trim();

            if (value === '') {
                isValid = false;
                field.addClass('is-invalid');
                if (!firstInvalidField) firstInvalidField = field;
            } else {
                field.removeClass('is-invalid');
            }
        });

        // 메모 필드는 선택사항이므로 별도 처리
        const memoField = $('#addMemo');
        memoField.removeClass('is-invalid');

        if (!isValid) {
            // // 유효성 검사 실패 시 처리
            showModal('입력 오류', '모든 필수 항목을 입력해주세요.');
            if (firstInvalidField) firstInvalidField.focus();
            return false;
        }

        console.log('모든 필드가 유효합니다.');
        return true;
    }

    /**
     * 다음 버튼 이벤트
     * - 선수 기본 정보 폼 비활성화
     * - 선수 추가 정보 폼 활성화
     */
    $('#nextInfoButton').on('click', function() {
        if (validationForm1()) switchFormMode('next');
    });

    /**
     * 이전 버튼 이벤트
     * - 선수 기본 정보 폼 활성화
     * - 선수 추가 정보 폼 비활성화
     */
    $('#backInfoButton').on('click', function() {
        switchFormMode('back');
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
                loadTransfer(currentPage);
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
            url: '/persons',
            method: 'GET',
            success: function(persons) {
                let playerSelect = $('#addSellPlayer');
                playerSelect.empty().append('<option value="">선수명 선택</option>');
                persons.forEach(person => {
                    playerSelect.append(`<option value="${person.personIdx}">${person.personName}</option>`);
                });
            },
            error: function(error) {
                console.error('선수 목록 로드 중 오류 발생:', error);
            }
        });
    }

    // 팀 옵션 로드 (강원FC 제외)
    function loadTeamOptions() {
        $.ajax({
            url: '/teams',
            method: 'GET',
            success: function(teams) {
                let buyTeamSelect = $('#addOpponent');
                let sellTeamSelect = $('#addSellOpponent');
                buyTeamSelect.empty().append('<option value="">상대팀 선택</option>');
                sellTeamSelect.empty().append('<option value="">상대팀 선택</option>');
                teams.forEach(team => {
                    if (team.teamName !== '강원FC') {
                        buyTeamSelect.append(`<option value="${team.teamName}">${team.teamName}</option>`);
                        sellTeamSelect.append(`<option value="${team.teamName}">${team.teamName}</option>`);
                    }
                });
            },
            error: function(error) {
                console.error('팀 목록 로드 중 오류 발생:', error);
            }
        });
    }

    // 이적 선수 저장 버튼
    $('#saveButton').on('click', function() {
        const selectedValue = $('input[name="transferType"]:checked').val();

        if (!validationForm1()) return;

        let price = $('#addPrice').val();

        var transferData = {
            personIdx: $('#addPlayerName').val(),
            transferDate: $('#addTransferDate').val(),
            price: price.replace(/,/g, ''),
            opponent: $('#addOpponent').val(),
            memo: $('#addMemo').val()
        };

        console.log('# transferData > ', transferData);

        var personData = {
            birthdate: $('#addPlayerBirthdate').val(),
            nationality: $('#addPlayerNationality').val(),
            backNumber: $('#addPlayerBackNumber').val(),
            position: $('input[name="playerPosition"]:checked').val(),
            contractStart: $('#addPlayerContractStart').val(),
            contractEnd: $('#addPlayerContractEnd').val(),
            height: $('#addPlayerHeight').val(),
            weight: $('#addPlayerWeight').val()
        };

        console.log('# personData > ', personData);

        // TODO: please implement below sutff, image upload
        /*
        let formData = new FormData();
        formData.append('transferData', JSON.stringify({
            transferType: "1",
            playerName: $('#addPlayerName').val(),
            transferDate: $('#addTransferDate').val(),
            price: removeCommas($('#addPrice').val()),
            opponent: $('#addOpponent').val(),
            memo: $('#addMemo').val()
        }));
        formData.append('additionalData', JSON.stringify(fieldVal));

        let imageFile = $('#addPlayerImage')[0].files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }
        */

        if (selectedValue === 'buy') {
            transferData.person = personData;
            const formData = transferData;
            // if (!validationForm2()) return;
            $.ajax({
                url: '/transfers/buy',
                method: 'POST',
                data: JSON.stringify(formData),
                processData: false,
                contentType: false,
                headers: {
                    [csrfHeader]: csrfToken
                },
                success: function (response) {

                },
                error: function (error) {

                }
            });
        } else if (selectedValue === 'sell') {
            const formData = transferData;
            $.ajax({
                url: '/transfers/sell',
                method: 'POST',
                data: JSON.stringify(formData),
                processData: false,
                contentType: 'application/json',
                headers: {
                    [csrfHeader]: csrfToken
                },
                success: function (response) {

                },
                error: function (error) {

                }
            });
            // $.ajax({
            //     url: '/transfers/sell',
            //     method: 'POST',
            //     data: Object.assign(baseInfoData, detailInfoData),
            //     processData: false,
            //     contentType: false,
            //     headers: {
            //         [csrfHeader]: csrfToken
            //     },
            //     success: function (response) {
            //         $('#sellConfirmModalLabel').modal('hide');
            //         loadTransfer();
            //     },
            //     error: function (error) {
            //         console.error('이적 정보 저장 중 오류 발생:', error);
            //         alert('이적 정보 저장 중 오류가 발생했습니다.');
            //     }
        }
    });

    function saveTransfer(transferData) {
        $.ajax({
            url: '/transfers/sell',
            method: 'POST',
            data: JSON.stringify(transferData),
            contentType: 'application/json',
            headers: {
                [csrfHeader]: csrfToken
            },
            success: function(response) {
                $('#addTransferModal').modal('hide');
                loadTransfer();
            },
            error: function(error) {
                console.error('이적 정보 저장 중 오류 발생:', error);
                alert('이적 정보 저장 중 오류가 발생했습니다.');
            }
        });
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

    // 초기 데이터 로드 호출
    loadTransfer(currentPage);

    function showModal(title, message, callback) {
        const modalElement = document.getElementById('customModal');
        const modalTitle = modalElement.querySelector('.modal-title');
        const modalBody = modalElement.querySelector('.modal-body');

        modalTitle.textContent = title;
        modalBody.textContent = message;
        modalBody.style.whiteSpace = 'pre-line';
        modalBody.style.wordWrap = 'break-word';

        const modal = new bootstrap.Modal(modalElement);
        // 이전 이벤트 리스너 제거
        $('#customModal').off('hidden.bs.modal');
        $('#customModal').on('hidden.bs.modal', callback);
        modal.show();
    }
});