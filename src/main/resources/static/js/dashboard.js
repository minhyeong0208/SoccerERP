// 전체 선수 수
let playerCount = 0;
function getPlayerCount(){
	fetch('http://localhost:80/persons/players')
	.then(response => response.json())
	.then(data => {
		playerCount = data.totalElements;
		console.log(playerCount);
		document.getElementById('player-count').textContent = `${playerCount}명~`;
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
			
			for(let i = 0; i < monthlyInjuryCount.length ; i++){
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
			for(let i = 0; i < positionCount.length ; i++){
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

function getFuturGames(){
	fetch('http://localhost:80/games/future')
	.then(response => response.json())
	.then(data => {
		futureGames = data;
		
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

document.addEventListener('DOMContentLoaded', function() {
	monthlyInjury();
	countPosition();
	getPlayerCount();
	getFuturGames();
})