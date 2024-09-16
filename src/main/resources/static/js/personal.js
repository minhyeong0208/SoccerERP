// CSRF 토큰을 meta 태그에서 가져옴
const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

document.addEventListener("DOMContentLoaded", function() {
	const coachId = loggedInCoachId;
	const editButton = document.getElementById("edit-button");
	const saveButton = document.getElementById("save-button");
	const passwordModal = document.getElementById("passwordModal");
	const confirmPasswordButton = document.getElementById("confirmPasswordButton");
	const modalClose = document.getElementById("modal-close");
	const form = document.getElementById("personal-info-form");
	let personIdx = null;

	const newPasswordInput = document.getElementById("newPassword");
	const confirmNewPasswordInput = document.getElementById("confirmNewPassword");

	if (coachId !== 'default_id') {
		// API를 호출하여 코치 정보를 가져옵니다.
		fetch(`/persons/coaches/${coachId}`)
			.then(response => response.json())
			.then(data => {
				if (data) {
					document.getElementById("coach-name").innerText = data.personName;
					document.getElementById("coach-birth").value = data.birth ? new Date(data.birth).toISOString().split('T')[0] : '';
					document.getElementById("coach-phone").value = data.phone ? data.phone : '';
					document.getElementById("coach-email").value = data.email ? data.email : '';
					document.getElementById("contract-start").innerText = new Date(data.contractStart).toLocaleDateString();
					document.getElementById("contract-end").innerText = new Date(data.contractEnd).toLocaleDateString();
					personIdx = data.personIdx;
				} else {
					console.error("코치 정보를 가져오지 못했습니다.");
				}
			});

		editButton.addEventListener("click", function() {
			passwordModal.style.display = "block";
		});

		modalClose.addEventListener("click", function() {
			passwordModal.style.display = "none";
		});

		// 비밀번호 확인 버튼 클릭
		confirmPasswordButton.addEventListener("click", function() {
			const password = document.getElementById("confirmPassword").value;
			fetch('/persons/verify-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					[csrfHeader]: csrfToken
				},
				body: JSON.stringify({ password })
			})
				.then(response => response.json())
				.then(result => {
					if (result.verified) {
						document.getElementById("coach-phone").disabled = false;
						document.getElementById("coach-email").disabled = false;
						document.getElementById("coach-birth").disabled = false;
						newPasswordInput.disabled = false;
						confirmNewPasswordInput.disabled = false;
						saveButton.style.display = "inline";
						passwordModal.style.display = "none";
					} else {
						alert("비밀번호가 틀렸습니다.");
					}
				})
				.catch(error => {
					console.error("비밀번호 확인 중 오류 발생:", error);
				});
		});

		form.addEventListener("submit", function(event) {
			event.preventDefault();
			const updatedData = {};

			const phone = document.getElementById("coach-phone").value;
			const email = document.getElementById("coach-email").value;
			const birth = document.getElementById("coach-birth").value;

			updatedData.phone = phone ? phone : '';
			updatedData.email = email ? email : '';
			updatedData.birth = birth ? birth : '';

			const newPassword = newPasswordInput.value;
			const confirmNewPassword = confirmNewPasswordInput.value;

			// 새 비밀번호가 입력된 경우 처리
			if (newPassword && confirmNewPassword) {
				if (newPassword === confirmNewPassword) {
					// 비밀번호 변경 API 요청
					fetch(`/persons/${personIdx}/change-password`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							[csrfHeader]: csrfToken
						},
						body: JSON.stringify({ newPassword })
					})
						.then(response => response.json())
						.then(data => {
							if (data) {
								alert("비밀번호가 성공적으로 변경되었습니다.");
							}
						})
						.catch(error => {
							console.error("비밀번호 변경 중 오류 발생:", error);
						});
				} else {
					alert("새 비밀번호가 일치하지 않습니다.");
					return;
				}
			}

			if (personIdx) {
				fetch(`/persons/${personIdx}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						[csrfHeader]: csrfToken
					},
					body: JSON.stringify(updatedData)
				})
					.then(response => {
						if (response.ok) {
							alert("정보가 성공적으로 업데이트되었습니다.");
							document.getElementById("coach-phone").disabled = true;
							document.getElementById("coach-email").disabled = true;
							document.getElementById("coach-birth").disabled = true;
							newPasswordInput.disabled = true;
							confirmNewPasswordInput.disabled = true;
							saveButton.style.display = "none";
						} else {
							alert("정보 업데이트에 실패했습니다.");
						}
					})
					.catch(error => {
						console.error("정보 업데이트 중 오류 발생:", error);
					});
			} else {
				console.error("personIdx가 존재하지 않습니다. 업데이트를 할 수 없습니다.");
			}
		});
	} else {
		console.error("로그인된 코치의 ID를 찾을 수 없습니다.");
	}
});
