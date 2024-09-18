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
            type: 'bar',
            data: {
                labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                datasets: [{
                    data: injuryByMonth,
                    backgroundColor: [
                        'rgba(50, 137, 131, 1)'
                    ],
                    borderColor: [
                        'rgba(50, 137, 131, 1)'
                    ],
                    borderWidth: 1,
                    borderRadius: 5,
                    borderSkipped: false,
                }]
            },
            options: {
                // 라벨 숨기기
                plugins: {
                    legend: {
                        display: false,
                        position: top,
                    },
                },
                scales: {
                    grid: false,
                    x: {
                        border: {
                            display: false,
                        },
                        grid: {
                            display: false,
                            drawOnChartArea: false,
                            drawTicks: false,
                        }
                    },
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: 3,
                        ticks: {
                            stepSize: 1,
                        },
                    }
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
            type: 'doughnut',
            data: {
                labels: ['DF', 'FW', 'GK', 'MF'],
                datasets: [{
                    data: countByposition,
                    backgroundColor: [
                        '#f57a4c',
                        '#ecddff',
                        '#fcd74f',
                        '#328b85',
                    ],
                    borderRadius: 10,
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                    },
                },
                maintainAspectRatio: false,
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

            //let tableBody = document.getElementById('upcoming-3-games');
            let a = document.getElementById('upcoming-games');
            let mappedGames = futureGames.map((game) => {
                const gameDate = new Date(game.gameDate);
                const gameDay = gameDate.getDate();
                const gameMonth = gameDate.getMonth() + 1;

                const homeTeam = game.isHome ? '강원FC' : game.opponent;
                const awayTeam = game.isHome ? game.opponent : '강원FC';

                return `<div class="upcoming-game">
                            <div class="date-flag">
                                <div class="game-date">
                                    ${gameDay}
                                </div>
                                <div class="game-date-month">
                                    ${gameMonth}월
                                </div>
                            </div>
                            <div class="upcoming-game-details">
                                ${homeTeam}<br>
                                ${'vs'}<br>
                                ${awayTeam}<br>
                                ${game.stadium}<br>
                            </div>
                            
                        </div>`;

                // return `<tr>
                //             <td>${game.gameDate}</td>
                //             <td>${homeTeam}</td>
                //             <td>${'vs'}</td>
                //             <td>${awayTeam}</td>
                //             <td>${game.stadium}</td>
                //         </tr>`;
            });

            //tableBody.innerHTML = mappedGames.join('');
            a.innerHTML = mappedGames.join('');
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
            const imageMap = {
                '강원': '강원FC.png',
                '광주': '광주FC.png',
                '김천': '김천상무FC.png',
                '대구': '대구FC.png',
                '대전': '대전 하나시티즈.png',
                '서울': '서울FC.png',
                '울산': '울산HD.png',
                '인천': '인천 유나이티드FC.png',
                '전북': '전북 현대.png',
                '제주': '제주 유나이티드FC.png',
                '수원FC': '수원FC.png',
                '포항': '포항 스틸러스.png'
            };

            let mappedData = data.map((rankData) => {
                const imageFileName = imageMap[rankData.title] || '';
                return `<tr>
                <td class="font-bold">${rankData.rank}</td>
                <td>
                    <img src="/img/team/${imageFileName}" style="width: 30px;">
                    ${rankData.title}
                </td>
                <td class="font-bold">${rankData.victoryPoint}</td>
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

            //document.getElementById('today-schedule-overview').textContent = `경기 : ${data.games.length}, 훈련 : ${data.trainings.length}, 부상 : ${data.injuries.length}`;

            if (!data.injuries || data.injuries.length !== 0) {
                console.log(`today's injuries : ${data.injuries.length}`);
                let injuriesText = '부상자 : ';
                data.injuries.map((injury) => {
                    injuriesText += `${injury.injuryIdx}  `;
                })
                document.getElementById('today-schedule-injuries').textContent = injuriesText;
            } else {
                document.getElementById('today-schedule-injuries').innerHTML = `<span class="no-schedule">오늘 부상자는 존재하지 않습니다.</span>`;
            }
            if (!data.games || data.games.length !== 0) {
                console.log(`today's games : ${data.games.length}`);
                document.getElementById('today-schedule-games').textContent = `경기 : ${data.games[0].opponent}랑 경기`;
            } else {
                document.getElementById('today-schedule-games').innerHTML = `<span class="no-schedule">오늘 경기는 존재하지 않습니다.</span>`;
            }
            if (!data.trainings || data.trainings.length !== 0) {
                console.log(`today's trainings : ${data.trainings}`);
                //document.getElementById('today-schedule-trainings').textContent = ``;
            } else {
                document.getElementById('today-schedule-trainings').innerHTML = `<span class="no-schedule">오늘 훈련은 존재하지 않습니다.</span>`;
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