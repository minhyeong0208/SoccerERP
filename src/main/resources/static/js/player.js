// pagination
let currentPage = 0;
const pageSize = 10;
const maxVisiblePages = 10; // 최대 표시 페이지 수
let totalPages = 1;

//
let selectedPlayer = {};
let totalPlayers = [];
let mappedPlayers = [];

// csrf
const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

// add header option when send http request (except GET)
// headers: {
//     'Content-Type': 'application/json',
//         [csrfHeader]: csrfToken
// },

// form 입력한 값 객체로 변환
const formToObject = (form) =>
    Array.from(new FormData(form)).reduce(
        (acc, [key, value]) => ({...acc, [key]: value}),
        {}
    );

// 전체 사람 정보 가져오기
function fetchPlayerData(page) {
    // search
    // const searchOption = '';
    // const searchKeyword = '';

    // fetch : get
    let url = `http://localhost/persons?page=${page}&size=${pageSize}`;
    // if(searchKeyword && searchOption) {
    //
    // }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // totalPlayers = data.totalElements;
            // console.log(`there are ${totalPlayers} players`);
            console.group(data.content);
            totalPlayers = data.content;

            totalPages = data.totalPages;

            let tableBody = document.getElementById('player-rows');

            // load players' data on table
            mappedPlayers = data.content
                //.filter()
                .map(
                    (player) => {
                        return `<tr class="player-row" data-id="${player.personIdx}">
                                        <td>
                                            <input type="checkbox" class="delete-checkbox" data-id="${player.personIdx}">
                                        </td>
                                        <td>
                                            ${player.personName}
                                        </td>
                                        <td>
                                            <span class="position position--${player.position}">
                                                ${player.position}
                                            </span>
                                        </td>
                                        <td>
                                            ${player.backNumber}
                                        </td>
                                    </tr>`;
                    }
                );

            tableBody.innerHTML = mappedPlayers.join('');

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
			            <button class="page-link" onclick="fetchPlayerData(${i})">${i + 1}</button>
			        </li>`;
            }

            // 이전/다음 그룹 버튼 활성화/비활성화 설정
            document.querySelector("#prevGroup").disabled = currentPage === 0;
            document.querySelector("#nextGroup").disabled = currentPage >= totalPages - 1;

            // 리스트 첫번째 데이터 상세보기
            console.log(totalPlayers[0]);
            showPlayerDetail(totalPlayers[0])

        })
        .catch(error => console.error('Error while fetching data', error))


}

// 선수 상세보기
function showPlayerDetail(player) {
    //console.log(player.birth);
    document.getElementById('detail-personName').value = player.personName;
    document.getElementById('detail-height').value = player.height;
    document.getElementById('detail-weight').value = player.weight;
    //document.getElementById('detail-position').value = player.position;
    //document.querySelector(`input[name="position"][value="${player.position}"]`).checked = true;
    // const positionIdMap = {
    //     'GK': 'detail-position-gk',
    //     'FW': 'detail-position-fw',
    //     'MF': 'detail-position-mf',
    //     'DF': 'detail-position-df'
    // };
    //
    // document.getElementById(positionIdMap[player.position]).checked = true;
    document.getElementById('detail-position-' + player.position.toLowerCase()).checked = true;
    document.getElementById('detail-birth').value = player.birth.split("T", 1);
    document.getElementById('detail-backNumber').value = player.backNumber;
    document.getElementById('detail-nationality').value = player.nationality;
    document.getElementById('detail-personIdx').value = player.personIdx;

    document.getElementById('player-name-backnumber').textContent = player.personIdx + ' ' + player.personName;
    document.getElementById('player-detail-image').setAttribute('src', `/img/persons/${player.personImage}`);
    document.getElementById('player-detail-image').setAttribute('onerror', `this.onerror = null; this.src = '/img/persons/default.png';`);

    //
    // let ctx = document.getElementById('player-ability-chart').getContext('2d');
    // let myChart;

    // 해당 선수 능력치 차트
    updateChart(player.ability);
}

let ctx = document.getElementById('player-ability-chart').getContext('2d');
let myChart;

// 차트 업데이트
function updateChart(data) {
    // destructing
    // if(data === null){
    //
    // }
    const {abilityIdx, ...abilities} = data;
    console.log(abilities);
    console.log(Object.values(abilities));
    console.log(Object.keys(abilities));

    if (myChart) {
        myChart.data.datasets[0].data = Object.values(abilities);
        myChart.update();
    } else {
        myChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: Object.keys(abilities),
                datasets: [{
                    data: Object.values(abilities),
                    backgroundColor: [
                        'rgba(140, 200, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgba(140, 200, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                // disabled label
                plugins: {
                    legend: {
                        display: false
                    },
                },
                maintainAspectRatio: true,
                responsive: true,
                scales: {
                    r: {
                        angleLines: {
                            color: 'tomato',
                            max: 100,
                            min: 20,
                            stepSize: 20,
                        }
                    }
                }
            }
        });
    }

}

// 특정 선수 클릭 시 우측에 상세보기
document.getElementById('player-table-widget').addEventListener('click', function (e) {
    const row = e.target.closest('tr.player-row');

    if (row) {
        const personIdx = row.getAttribute('data-id');
        const player = totalPlayers.find(player => player.personIdx === parseInt(personIdx));
        if (player) {
            showPlayerDetail(player);
            updateChart(player.ability);
        }
    }
})

// 선수 추가 모달
const modal = document.getElementById("player-modal");
const modalTitle = document.getElementById("modalTitle");
const dateLabel = document.getElementById("dateLabel");
const addPlayerButton = document.getElementById("add-player-btn");
const closeButtons = document.getElementsByClassName("close");

// 모달 닫기
for (let i = 0; i < closeButtons.length; i++) {
    closeButtons[i].onclick = function() {
        modal.style.display = "none";
    }
}

// 실시간(?) range 값
function updateAbilityValue(id, val) {
    document.getElementById('show-' + id).textContent = val;
}

// add
// 선수 추가 입력폼 모달
addPlayerButton.onclick = function () {
    //alert('clicked');
    modal.style.display = "block";
}

// 선수 추가
//personName, teamIdx, facilityIdx, position, backNumber, height, weight, birth, nationality, ability, typeCode, personImage
document.getElementById('submit-player').addEventListener('click', function () {
    const playerAbility = formToObject(document.getElementById('add-player-ability'));
    const playerInfo = formToObject(document.getElementById('add-player-info'));
    const playerInfoWithAbility = {...playerInfo, ability: playerAbility};
    console.log(playerInfoWithAbility);

    //
    const formData = new FormData();

    formData.append('person', new Blob([JSON.stringify(playerInfoWithAbility)], {type: 'application/json'}));
    const fileInput = document.getElementById('add-personImage');
    formData.append('file', fileInput.files[0]);

    postPlayer(formData);
})

function postPlayer(formData) {
    fetch('http://localhost:80/persons/add-player-with-image', {
        method: "POST",
        headers: {
            [csrfHeader]: csrfToken
        },
        body: formData,
    })
        .then(response => response.json())
        .then(result => {
            if (result != null) {
                alert("성공적으로 추가되었습니다!");

                fetchPlayerData(currentPage); // 새로 추가된 선수 데이터를 갱신
                modal.style.display = "none";
            } else {
                alert("관리자에게 문의하세요");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("서버와의 통신 중 오류가 발생했습니다.");
        });
}

// update
document.getElementById('update-player').addEventListener('click', function () {
    const playerInfo = formToObject(document.getElementById('detail-player-info'));
    console.log(playerInfo);

    const formData = new FormData();

    formData.append('person', new Blob([JSON.stringify(playerInfo)], {type: 'application/json'}));
    const fileInput = document.getElementById('update-personImage');
    formData.append('file', fileInput.files[0]);

    putPlayer(playerInfo.personIdx, formData);
});

function putPlayer(id, formData){
    if(confirm('수정하시겠습니까?')){
        fetch(`http://localhost:80/persons/${id}/with-image`, {
            method: "PUT",
            headers: {
                [csrfHeader]: csrfToken
            },
            body: formData,
        })
            .then(response => response.json())
            .then(result => {
                if (result != null) {
                    alert("성공적으로 수정되었습니다!");

                    fetchPlayerData(currentPage); // 새로 추가된 선수 데이터를 갱신
                    modal.style.display = "none";
                } else {
                    alert("관리자에게 문의하세요");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("서버와의 통신 중 오류가 발생했습니다.");
            });
    }

}

// delete
document.getElementById('delete-player-btn').addEventListener('click', function () {
    deletePlayer();
})

function deletePlayer(){
    const selectedCheckboxes = document.querySelectorAll('.delete-checkbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));

    if (selectedIds.length === 0) {
        alert('삭제할 항목을 선택하세요.');
        return;
    }
    if (confirm('삭제하시겠습니까?')) {
        const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

        fetch('http://localhost:80/persons/delete-multiple', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(selectedIds)
        })
            .then(response => response.text())
            .then(result => {
                if (result) {
                    alert(result);
                    fetchPlayerData(currentPage);
                } else {
                    alert('ㅠㅠ');
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("서버와의 통신 중 오류가 발생했습니다.");
            });
    }
}

// 체크박스 전체 클릭
document.querySelector("#selectAllCheckbox").addEventListener("change", function () {
    const isChecked = this.checked;
    const checkboxes = document.querySelectorAll(".delete-checkbox");

    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
});

// 페이지 로드 시
document.addEventListener('DOMContentLoaded', function () {
    fetchPlayerData(currentPage);
})




