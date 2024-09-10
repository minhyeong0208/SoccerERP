// pagination
let currentPage = 0;
const pageSize = 10;
const maxVisiblePages = 10; // 최대 표시 페이지 수
let totalPages = 1;

// coach data
let totalCoaches = [];
let mappedCoaches = [];

// csrf
const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

// add header option when send http request (except GET)
// headers: {
//     'Content-Type': 'application/json',
//         [csrfHeader]: csrfToken
// },

// form value to Object
const formToObject = (form) =>
    Array.from(new FormData(form)).reduce(
        (acc, [key, value]) => ({...acc, [key]: value}),
        {}
    );

// get whole data
function fetchCoachData(page) {
    // search
    // const searchOption = '';
    // const searchKeyword = '';

    // fetch : get
    let url = `http://localhost/persons/coaches?page=${page}&size=${pageSize}`;
    // if(searchKeyword && searchOption) {
    //
    // }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            //console.group(data.content);
            totalCoaches = data.content;
            totalPages = data.totalPages;

            const pageButtons = document.querySelector("#pageButtons");

            let tableBody = document.getElementById('person-rows');

            mappedCoaches = data.content
                .map(
                    (coach) => {
                        return `<tr class="person-rows" data-id="${coach.personIdx}">
                                        <td>
                                            <input type="checkbox" class="delete-checkbox" data-id="${coach.personIdx}">
                                        </td>
                                        <td>
                                            ${coach.personName}
                                        </td>
                                        <td>
                                            <span class="position position--${coach.position}">
                                                ${coach.position}
                                            </span>
                                        </td>
                                    </tr>`;
                    }
                );
            tableBody.innerHTML = mappedCoaches.join('');

            // 페이지 버튼 초기화
            pageButtons.innerHTML = '';

            // 중앙을 기준으로 10페이지 생성
            let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages);

            if (endPage - startPage < maxVisiblePages) {
                startPage = Math.max(0, endPage - maxVisiblePages);
            }

            // 페이징 버튼 생성
            for (let i = startPage; i < endPage; i++) {
                pageButtons.innerHTML += `
			        <li class="page-item ${i === page ? 'active' : ''}">
			            <button class="page-link" onclick="fetchCoachData(${i})">${i + 1}</button>
			        </li>`;
            }

            // 이전/다음 그룹 버튼 활성화/비활성화 설정
            document.querySelector("#prevGroup").disabled = currentPage === 0;
            document.querySelector("#nextGroup").disabled = currentPage >= totalPages - 1;

            // 리스트 첫번째 데이터 상세보기
            console.log(totalCoaches[0]);
            showDetail(totalCoaches[0]);

        })
        .catch(error => console.error('Error while fetching data', error))
}

// 상세보기
function showDetail(person) {
    document.getElementById('detail-personName').value = person.personName;
    document.getElementById('detail-height').value = person.height;
    document.getElementById('detail-weight').value = person.weight;
    document.getElementById('detail-position').value = person.position;
    document.getElementById('detail-birth').value = person.birth.split("T", 1);
    document.getElementById('detail-backNumber').value = person.backNumber;
    document.getElementById('detail-nationality').value = person.nationality;
    document.getElementById('detail-personIdx').value = person.personIdx;

    document.getElementById('person-detail-image').setAttribute('src', `/img/persons/${person.personImage}`);
    document.getElementById('person-detail-image').setAttribute('onerror', `this.onerror = null; this.src = '/img/persons/default.png';`);

}

// 특정 사람 상세보기
document.getElementById('person-table-widget').addEventListener('click', function (e) {
    const row = e.target.closest('tr.person-rows');

    if (row) {
        const personIdx = row.getAttribute('data-id');
        // 비효율적... 수정하기
        const person = totalCoaches.find(person => person.personIdx === parseInt(personIdx));
        if (person) {
            showDetail(person);
        }
    }
})

document.addEventListener('DOMContentLoaded', function () {
    fetchCoachData(currentPage);
})

// 페이징 - 이전 페이지
document.querySelector("#prevGroup").onclick = () => {
    if (currentPage > 0) {
        currentPage--;
        fetchCoachData(currentPage);
    }
};

// 페이징 - 다음 페이지
document.querySelector("#nextGroup").onclick = () => {
    if (currentPage < totalPages - 1) {
        currentPage++;
        fetchCoachData(currentPage);
    }
};