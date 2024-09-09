let currentPage = 0;
const pageSize = 10;
const maxVisiblePages = 10;
let totalPages = 1;
let selectedTrainIdx = null;
let playersToAdd = []; // 추가할 선수 목록 저장
let playersToRemove = []; // 제거할 선수 목록 저장
let currentParticipants = []; // 현재 참가자 목록 저장

const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

// 훈련 리스트 로드
function loadTrainData(page) {
	fetch(`http://localhost/trains?page=${page}&size=${pageSize}`)
		.then(response => response.json())
		.then(data => {
			const table = document.querySelector("#trainTable tbody");
			table.innerHTML = '';

			data.content.forEach(train => {
				const row = document.createElement('tr');
				row.setAttribute('data-id', train.trainIdx);
				row.innerHTML = `
                    <td><input type="checkbox" class="delete-checkbox" data-id="${train.trainIdx}"></td>
                    <td>${train.trainName}</td>
                    <td>${formatTime(train.startTime)}</td>
                    <td>${formatTime(train.endTime)}</td>
                    <td>${formatDate(train.startDate)}</td>
                    <td>${formatDate(train.endDate)}</td>
                    <td>${train.countMem}</td>
                `;
				row.addEventListener('click', () => showTrainDetails(train));
				table.appendChild(row);
			});

			totalPages = data.totalPages; // totalPages 업데이트
			updatePaginationButtons(page, data.totalPages);

			// 모두 선택 체크박스 동작 처리
			handleSelectAll();
		})
		.catch(error => console.error('Error fetching data:', error));
}

// 페이지네이션 버튼 생성
function updatePaginationButtons(page, totalPages) {
    const pageButtons = document.querySelector("#pageButtons");
    pageButtons.innerHTML = '';  // 이전 페이지 버튼들을 초기화

    let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages);

    for (let i = startPage; i < endPage; i++) {
        pageButtons.innerHTML += `
            <li class="page-item ${i === page ? 'active' : ''}">
                <button class="page-link" onclick="loadTrainData(${i})">${i + 1}</button>
            </li>`;
    }

    // 이전 버튼 활성화/비활성화 설정
    document.querySelector("#prevGroup").disabled = page === 0;
    // 다음 버튼 활성화/비활성화 설정
    document.querySelector("#nextGroup").disabled = page >= totalPages - 1;
}

// 이전/다음 버튼 이벤트 추가
document.getElementById('prevGroup').addEventListener('click', function() {
    if (currentPage > 0) {
        currentPage--;
        loadTrainData(currentPage); // 이전 페이지로 이동
    }
});

document.getElementById('nextGroup').addEventListener('click', function() {
    if (currentPage < totalPages - 1) {
        currentPage++;
        loadTrainData(currentPage); // 다음 페이지로 이동
    }
});

// 모두 선택 체크박스 처리
function handleSelectAll() {
	const selectAllCheckbox = document.getElementById('selectAllCheckbox');
	const checkboxes = document.querySelectorAll('.delete-checkbox');

	selectAllCheckbox.addEventListener('change', function() {
		checkboxes.forEach(checkbox => {
			checkbox.checked = this.checked;
		});
	});

	// 개별 체크박스 선택 시 모두 선택 체크박스 상태 업데이트
	checkboxes.forEach(checkbox => {
		checkbox.addEventListener('change', function() {
			if (!this.checked) {
				selectAllCheckbox.checked = false;
			} else if (Array.from(checkboxes).every(cb => cb.checked)) {
				selectAllCheckbox.checked = true;
			}
		});
	});
}

// 선수 목록의 전체 선택 체크박스 처리
function handleSelectAllPlayers() {
    const selectAllPersonCheckbox = document.getElementById('selectAllPerson');
    const playerCheckboxes = document.querySelectorAll('.player-checkbox');

    // 전체 선택 체크박스 클릭 시 모든 선수 체크박스 선택/해제
    selectAllPersonCheckbox.addEventListener('change', function() {
        playerCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;

            // 체크 여부에 따라 선수 추가/제거 처리
            const personIdx = parseInt(checkbox.value);
            if (this.checked) {
                // 체크된 경우 추가 목록에 없는 선수만 추가
                if (!currentParticipants.includes(personIdx) && !playersToAdd.includes(personIdx)) {
                    playersToAdd.push(personIdx);
                }
                // 제거 목록에서 제거
                const removeIndex = playersToRemove.indexOf(personIdx);
                if (removeIndex > -1) {
                    playersToRemove.splice(removeIndex, 1);
                }
            } else {
                // 해제된 경우 제거 목록에 없는 참가자만 제거 목록에 추가
                if (currentParticipants.includes(personIdx) && !playersToRemove.includes(personIdx)) {
                    playersToRemove.push(personIdx);
                }
                // 추가 목록에서 제거
                const addIndex = playersToAdd.indexOf(personIdx);
                if (addIndex > -1) {
                    playersToAdd.splice(addIndex, 1);
                }
            }
        });
    });

    // 개별 체크박스 선택 시 전체 선택 체크박스 상태 업데이트
    playerCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const personIdx = parseInt(this.value);
            if (this.checked) {
                // 체크된 경우
                if (!currentParticipants.includes(personIdx) && !playersToAdd.includes(personIdx)) {
                    playersToAdd.push(personIdx);
                }
                const removeIndex = playersToRemove.indexOf(personIdx);
                if (removeIndex > -1) {
                    playersToRemove.splice(removeIndex, 1);
                }
            } else {
                // 체크 해제된 경우
                if (currentParticipants.includes(personIdx) && !playersToRemove.includes(personIdx)) {
                    playersToRemove.push(personIdx);
                }
                const addIndex = playersToAdd.indexOf(personIdx);
                if (addIndex > -1) {
                    playersToAdd.splice(addIndex, 1);
                }
            }

            // 모든 체크박스가 선택된 경우 전체 선택 체크박스 활성화
            if (Array.from(playerCheckboxes).every(cb => cb.checked)) {
                selectAllPersonCheckbox.checked = true;
            } else {
                selectAllPersonCheckbox.checked = false;
            }
        });
    });
}

// 훈련 상세 정보 표시 및 선수 목록 로드
function showTrainDetails(train) {
	document.getElementById('noSelectionMessage').style.display = 'none';
	document.getElementById('trainInfo').style.display = 'block';

	document.getElementById('detailTrainName').textContent = train.trainName;
	document.getElementById('detailStartDate').textContent = formatDate(train.startDate);
	document.getElementById('detailEndDate').textContent = formatDate(train.endDate);
	document.getElementById('detailStartTime').textContent = formatTime(train.startTime);
	document.getElementById('detailEndTime').textContent = formatTime(train.endTime);
	document.getElementById('detailCountMem').textContent = train.countMem;
	document.getElementById('detailArea').textContent = train.area;
	document.getElementById('detailMemo').textContent = train.memo;

	selectedTrainIdx = train.trainIdx;
	loadParticipants(selectedTrainIdx);
	loadPlayerData(selectedTrainIdx);

	document.getElementById('playerSection').style.display = 'block';
}

// 훈련 참가자 목록 로드
function loadParticipants(trainIdx) {
	fetch(`/trains/${trainIdx}`)
		.then(response => response.json())
		.then(data => {
			const participantsContainer = document.getElementById('participantsContainer');
			participantsContainer.innerHTML = data.trainMems.map(mem => mem.person.personName).join(', ') || '참가자가 없습니다.';
			currentParticipants = data.trainMems.map(mem => mem.person.personIdx); // 현재 참가자 목록 저장
		})
		.catch(error => console.error('참가자 목록을 불러오는 중 오류 발생:', error));
}

// 선수 목록 가져오기
function loadPlayerData(trainIdx) {
    fetch('http://localhost/persons/players')
        .then(response => response.json())
        .then(players => {
            return fetch(`/trains/${trainIdx}`)
                .then(response => response.json())
                .then(training => {
                    const participants = training.trainMems.map(mem => mem.person.personIdx);
                    const table = document.querySelector("#playerTable tbody");
                    table.innerHTML = '';
                    playersToAdd = []; // 초기화
                    playersToRemove = []; // 초기화

                    players.forEach(player => {
                        const isChecked = participants.includes(player.personIdx) ? 'checked' : '';
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td><input type="checkbox" class="player-checkbox" value="${player.personIdx}" ${isChecked}></td>
                            <td>${player.backNumber}</td>
                            <td>${player.personName}</td>
                            <td>${player.position}</td>
                        `;
                        table.appendChild(row);
                    });

                    handleSelectAllPlayers(); // 전체 선택 체크박스 및 개별 체크박스 동작 처리
                });
        })
        .catch(error => console.error('Error fetching player data:', error));
}

// 선수 추가/삭제 버튼 클릭 시 서버로 변경 사항 전송
document.getElementById('addPlayersToTrain').addEventListener('click', function() {
    if (playersToAdd.length > 0) {
        // 추가할 선수 서버에 전송
        fetch(`/trains/${selectedTrainIdx}/add-participants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(playersToAdd)
        })
            .then(response => {
                if (!response.ok) throw new Error('참가자 추가 실패');
                return response.json();
            })
            .then(() => {
                console.log(`참가자 ${playersToAdd.join(", ")} 추가 성공`);
                loadParticipants(selectedTrainIdx); // 참가자 목록 새로 로드
                loadPlayerData(selectedTrainIdx); // 선수 목록 다시 로드하여 체크 상태 업데이트
            })
            .catch(error => console.error('참가자 추가 중 오류 발생:', error));
    }

    if (playersToRemove.length > 0) {
        // 제거할 선수 서버에 전송
        playersToRemove.forEach(personIdx => {
            fetch(`/trains/${selectedTrainIdx}/remove-participant/${personIdx}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    [csrfHeader]: csrfToken
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error('참가자 삭제 실패');
                    return response.text();
                })
                .then(() => {
                    console.log(`참가자 ${personIdx} 삭제 성공`);
                    loadParticipants(selectedTrainIdx); // 참가자 목록 새로 로드
                    loadPlayerData(selectedTrainIdx); // 선수 목록 다시 로드하여 체크 상태 업데이트
                })
                .catch(error => console.error('참가자 삭제 중 오류 발생:', error));
        });
    }
});

// 훈련 추가 버튼 클릭 시
document.getElementById('submitTrain').addEventListener('click', function() {
	const trainName = document.getElementById('trainName').value;
	const startDate = document.getElementById('startDate').value;
	const endDate = document.getElementById('endDate').value;
	const startTime = document.getElementById('startTime').value;
	const endTime = document.getElementById('endTime').value;
	const trainArea = document.getElementById('trainPlace').value;
	const trainMemo = document.getElementById('trainMemo').value;
	const countMem = document.getElementById('limitCount').value;

	// 필드 값이 올바르게 입력되었는지 확인
	if (!trainName || !startDate || !endDate || !startTime || !endTime || !trainArea || !countMem) {
		alert("모든 필드를 입력해 주세요.");
		return;
	}

	const newTrain = {
		trainName: trainName,
		startDate: `${startDate}T${startTime}:00.000+00:00`,
		endDate: `${endDate}T${endTime}:00.000+00:00`,
		startTime: `${startDate}T${startTime}:00.000+00:00`,
		endTime: `${endDate}T${endTime}:00.000+00:00`,
		area: trainArea,
		memo: trainMemo,
		countMem: countMem
	};

	// 서버로 훈련 추가 요청
	fetch('/trains', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			[csrfHeader]: csrfToken
		},
		body: JSON.stringify(newTrain)
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('훈련 추가 실패');
			}
			return response.json();
		})
		.then(data => {
			console.log('훈련 추가 성공:', data);
			loadTrainData(currentPage); // 훈련 목록 다시 로드
			// 입력 필드 초기화
			document.getElementById('trainName').value = '';
			document.getElementById('startDate').value = '';
			document.getElementById('endDate').value = '';
			document.getElementById('startTime').value = '';
			document.getElementById('endTime').value = '';
			document.getElementById('trainPlace').value = '';
			document.getElementById('trainMemo').value = '';
			document.getElementById('limitCount').value = '';

			// 모달 닫기
			const modalElement = document.getElementById('trainModal');  // 모달의 ID를 정확히 사용
			const modalInstance = bootstrap.Modal.getInstance(modalElement);
			modalInstance.hide();
		})
		.catch(error => {
			console.error('훈련 추가 중 오류 발생:', error);
		});
});

// 훈련 수정 모달 열기
document.getElementById('editTrainButton').addEventListener('click', function() {
	if (!selectedTrainIdx) {
		alert('수정할 훈련을 선택하세요.');
		return;
	}

	fetch(`/trains/${selectedTrainIdx}`)
		.then(response => response.json())
		.then(train => {
			document.getElementById('editTrainName').value = train.trainName;
			document.getElementById('editTrainPlace').value = train.area;
			document.getElementById('editStartDate').value = formatDate(train.startDate);
			document.getElementById('editEndDate').value = formatDate(train.endDate);
			document.getElementById('editStartTime').value = formatTime(train.startTime);
			document.getElementById('editEndTime').value = formatTime(train.endTime);
			document.getElementById('editLimitCount').value = train.countMem;
			document.getElementById('editTrainMemo').value = train.memo;
		})
		.catch(error => console.error('Error fetching train data:', error));

	const editModal = new bootstrap.Modal(document.getElementById('editTrainModal'));
	editModal.show();
});

// 훈련 수정 후 즉시 화면 갱신
document.getElementById('saveTrainChanges').addEventListener('click', function() {
	const startDate = document.getElementById('editStartDate').value;
	const endDate = document.getElementById('editEndDate').value;
	const startTime = document.getElementById('editStartTime').value;
	const endTime = document.getElementById('editEndTime').value;
	const startDateTime = `${startDate}T${startTime}:00.000+00:00`;
	const endDateTime = `${endDate}T${endTime}:00.000+00:00`;

	const updatedTrain = {
		trainName: document.getElementById('editTrainName').value,
		area: document.getElementById('editTrainPlace').value,
		startDate: startDate,
		endDate: endDate,
		startTime: startDateTime,
		endTime: endDateTime,
		memo: document.getElementById('editTrainMemo').value,
		countMem: document.getElementById('editLimitCount').value
	};

	fetch(`/trains/${selectedTrainIdx}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			[csrfHeader]: csrfToken
		},
		body: JSON.stringify(updatedTrain)
	})
		.then(response => {
			if (!response.ok) throw new Error('훈련 수정 실패');
			return response.json();
		})
		.then(() => {
			loadTrainData(currentPage); // 훈련 목록 다시 로드
			showTrainDetails(updatedTrain); // 수정된 훈련 상세 정보 업데이트
			const editModal = bootstrap.Modal.getInstance(document.getElementById('editTrainModal'));
			editModal.hide();
		})
		.catch(error => console.error('훈련 수정 중 오류 발생:', error));
});

document.getElementById('deleteTrainButton').addEventListener('click', function() {
	if (!selectedTrainIdx) {
		alert('삭제할 훈련을 선택하세요.');
		return;
	}

	const confirmDelete = confirm('정말로 이 훈련을 삭제하시겠습니까?');
	if (!confirmDelete) {
		return;
	}

	// 서버로 삭제 요청
	fetch(`/trains/${selectedTrainIdx}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			[csrfHeader]: csrfToken
		}
	})
		.then(response => {
			if (!response.ok) throw new Error('훈련 삭제 실패');
			return response.text();
		})
		.then(() => {
			console.log(`훈련 ${selectedTrainIdx} 삭제 성공`);

			// 훈련 삭제 후 상세 정보와 선수 리스트 숨기기
			document.getElementById('trainInfo').style.display = 'none';
			document.getElementById('playerSection').style.display = 'none';
			document.getElementById('noSelectionMessage').style.display = 'block';

			// 훈련 목록을 다시 로드
			loadTrainData(currentPage);

			// 삭제 후 선택된 훈련 초기화
			selectedTrainIdx = null;
		})
		.catch(error => {
			console.error('훈련 삭제 중 오류 발생:', error);
		});
});


// 선택된 항목 삭제
document.querySelector('button[type="deleteButton"]').addEventListener('click', function() {
	const selectedCheckboxes = document.querySelectorAll('.delete-checkbox:checked');
	const selectedTrainIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));

	if (selectedTrainIds.length === 0) {
		alert('삭제할 항목을 선택하세요.');
		return;
	}

	if (!confirm('선택한 항목을 삭제하시겠습니까?')) {
		return;
	}

	// 선택된 훈련 삭제 요청
	selectedTrainIds.forEach(trainId => {
		fetch(`/trains/${trainId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				[csrfHeader]: csrfToken
			}
		})
			.then(response => {
				if (!response.ok) throw new Error(`훈련 ${trainId} 삭제 실패`);
				return response.text();
			})
			.then(() => {
				console.log(`훈련 ${trainId} 삭제 성공`);
				
				// 삭제된 후에는 오른쪽 상세 영역 비우기
				document.getElementById('trainInfo').style.display = 'none';
				document.getElementById('noSelectionMessage').style.display = 'block';
				document.getElementById('playerSection').style.display = 'none';

				// 훈련 목록 다시 로드
				loadTrainData(currentPage);

				// 선택된 훈련 초기화
				selectedTrainIdx = null;
			})
			.catch(error => console.error('훈련 삭제 중 오류 발생:', error));
	});
});

// 날짜, 시간 포맷 변환 함수
function formatDate(dateStr) {
	return new Date(dateStr).toISOString().split('T')[0];
}

function formatTime(dateStr) {
	return new Date(dateStr).toISOString().split('T')[1].substring(0, 5);
}

// 페이지 로드 시 초기 데이터 로드
document.addEventListener("DOMContentLoaded", function() {
	loadTrainData(currentPage);
	document.getElementById('trainInfo').style.display = 'none';
	document.getElementById('noSelectionMessage').style.display = 'block';
});
