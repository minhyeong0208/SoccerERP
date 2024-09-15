// 전체 선수 수
let playerCount = 0;

function getPlayerCount() {
    fetch('http://localhost:80/persons/players')
        .then(response => response.json())
        .then(data => {
            playerCount = data.totalElements;
            console.log(playerCount);
            document.getElementById('player-count').textContent = `${playerCount}명~`;
        })
}

// 전체 부상자 수
function getInjured() {
    fetch('http://localhost:80/injuries')
        .then(response => response.json())
        .then(data => {
            console.log(`getInjured : ${data.totalElements}`);
            document.getElementById('injury-count').textContent = `${data.totalElements}명~`;
        })
}

// 월별 부상자
let monthlyInjuryCount = [];
let injuryByMonth = [];

// 월별 부상자 차트
let ctx = document.getElementById('monthly-injury-counts').getContext('2d');
let monthlyInjuryChart;

function monthlyInjury() {
    fetch('http://localhost:80/injuries/monthly-injury-counts')
        .then(response => response.json())
        .then(data => {
                console.log(data);
                monthlyInjuryCount = data;

                for (let i = 0; i < monthlyInjuryCount.length; i++) {
                    injuryByMonth.push(monthlyInjuryCount[i].count);
                }
                console.log(injuryByMonth);
                updateChart(monthlyInjuryCount);
            }
        )
}

// 월별 부상자 차트 업데이트
function updateChart(monthlyInjuryCount) {
    if (monthlyInjuryChart) {
        //monthlyInjuryChart.data.datasets[0].data = Object.values(abilities);
        //monthlyInjuryChart.update();
    } else {
        monthlyInjuryChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                datasets: [{
                    data: injuryByMonth,
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
                // 라벨 숨기기
                plugins: {
                    legend: {
                        display: false
                    },
                },
                maintainAspectRatio: true,
                responsive: true,
            }
        });
    }

}

// 포지션별 선수 수
let positionCount = [];
let countByposition = [];

function countPosition() {
    fetch('http://localhost:80/persons/positions/count')
        .then(response => response.json())
        .then(data => {
                console.log(data);
                positionCount = data;

                console.log(positionCount.length);
                for (let i = 0; i < positionCount.length; i++) {
                    countByposition.push(positionCount[i].count);
                }
                console.log(countByposition);
                updateChart2(countByposition);
            }
        )
}

let ctx2 = document.getElementById('position-count').getContext('2d');
let positionCountChart;

// 포지션별 선수 차트 업데이트
function updateChart2(countByposition) {
    if (positionCountChart) {
        //monthlyInjuryChart.data.datasets[0].data = Object.values(abilities);
        //monthlyInjuryChart.update();
    } else {
        positionCountChart = new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: ['DF', 'FW', 'GK', 'MF'],
                datasets: [{
                    data: countByposition,
                }]
            },
            options: {
                maintainAspectRatio: true,
                responsive: true,
            }
        });
    }

}

// 미래 3경기
let futureGames = [];

function getFuturGames() {
    fetch('http://localhost:80/games/future')
        .then(response => response.json())
        .then(data => {
            futureGames = data;
            console.group(futureGames);

            let tableBody = document.getElementById('upcoming-3-games');
            let mappedGames = futureGames.map((game) => {
                return `<tr>
                            <td>${game.gameDate}</td>
                            <td>${'강원FC'}</td>
                            <td>${'vs'}</td>
                            <td>${game.opponent}</td>
					</tr>`;
            });

            tableBody.innerHTML = mappedGames.join('');
        })
}

// 순위표
function getRankTable() {
    fetch('http://localhost:80/rank')
        .then(response => response.json())
        .then(data => {
            //console.table(data);

            // 랭킹, 팀명, 승점, 승무패
            let tableBody = document.getElementById('rank-table-rows');
            let mappedData = data.map((rankData) => {
                return `<tr>
							<td>${rankData.rank}</td>
							<td>${rankData.title}</td>
							<td>${rankData.victoryPoint}</td>
							<td>${rankData.victory}</td>
							<td>${rankData.draw}</td>
							<td>${rankData.defeat}</td>
						</tr>`;
            });

            tableBody.innerHTML = mappedData.join('');
        })
}

// 오늘의 일정
let todaySchedule = [];

function getTodaySchedule() {
    fetch('http://localhost:80/schedule/today')
        .then(response => response.json())
        .then(data => {
            console.group(data);

            document.getElementById('today-schedule-overview').textContent = `경기 : ${data.games.length}, 훈련 : ${data.trainings.length}, 부상 : ${data.injuries.length}`;

            if (!data.injuries || data.injuries.length !== 0) {
                console.log(`today's injuries : ${data.injuries.length}`);
                let injuriesText = '부상자 : ';
                data.injuries.map((injury) => {
                    injuriesText += `${injury.injuryIdx}  `;
                })
                document.getElementById('today-schedule-injuries').textContent = injuriesText;
            }
            if (!data.games || data.games.length !== 0) {
                console.log(`today's games : ${data.games.length}`);
                document.getElementById('today-schedule-games').textContent = `경기 : ${data.games[0].opponent}랑 경기`;
            }
            if (!data.trainings || data.trainings.length !== 0) {
                console.log(`today's trainings : ${data.trainings}`);
                //document.getElementById('today-schedule-trainings').textContent = ``;
            }


        })
}

// 부위별 부상자 수 전월과 비교
let ctx3 = document.getElementById('injuries-count-compare').getContext('2d');
let injuriesCountCompare;

function getInjuriesCompare() {
    fetch('http://localhost:80/injuries/compare')
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
}

// 부상자 수 비교 차트 업데이트
// function updateChart3() {
//     if () {
//         //monthlyInjuryChart.data.datasets[0].data = Object.values(abilities);
//         //monthlyInjuryChart.update();
//     } else {
//         positionCountChart = new Chart(ctx2, {
//             type: 'pie',
//             data: {
//                 labels: ['DF', 'FW', 'GK', 'MF'],
//                 datasets: [{
//                     data: countByposition,
//                 }]
//             },
//             options: {
//                 maintainAspectRatio: true,
//                 responsive: true,
//             }
//         });
//     }
//
// }



// 페이지 로드
document.addEventListener('DOMContentLoaded', function () {
    monthlyInjury();
    countPosition();
    getPlayerCount();
    getFuturGames();
    getRankTable();
    getInjured();
    getTodaySchedule();
    getInjuriesCompare();
})