document.addEventListener("DOMContentLoaded", function () {
    // Thymeleaf에서 전달된 로그인된 코치의 ID를 사용하여 데이터를 불러옵니다.
    const coachId = loggedInCoachId; // 로그인된 코치의 ID
    console.log(coachId);
    
    if (coachId !== 'default_id') {
        // API 호출을 통해 코치 데이터를 가져옵니다.
        fetch(`/persons/coaches/${coachId}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    // 코치 정보를 페이지에 표시합니다.
                    document.getElementById("coach-name").innerText = data.personName;
                    document.getElementById("coach-birth").innerText = new Date(data.birth).toLocaleDateString();
                    document.getElementById("coach-phone").innerText = data.phone;
                    document.getElementById("coach-email").innerText = data.email;
                    document.getElementById("contract-start").innerText = new Date(data.contractStart).toLocaleDateString();
                    document.getElementById("contract-end").innerText = new Date(data.contractEnd).toLocaleDateString();
                } else {
                    console.error("코치 정보를 가져오지 못했습니다.");
                }
            })
            .catch(error => {
                console.error("Error fetching coach data:", error);
            });
    } else {
        console.error("로그인된 코치의 ID를 찾을 수 없습니다.");
    }
});
