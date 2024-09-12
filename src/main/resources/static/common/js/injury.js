$(document).ready(function() {
    // 페이지가 로드될 때 부상 데이터를 로드합니다.
    loadInjuryData();
    
    // Example function to fetch injury data from an API and populate the table
    function loadInjuryData() {
        // Placeholder URL, replace with your actual API endpoint
        $.ajax({
            url: '/api/injuries',
            method: 'GET',
            success: function(data) {
                // Clear existing data
                $('table tbody').empty();

                // Populate table with API data
                data.forEach(function(injury) {
                    const row = `<tr>
                        <td>${injury.registerNumber}</td>
                        <td>${injury.name}</td>
                        <td>${injury.injuryDate}</td>
                        <td><button class="btn btn-info" data-toggle="modal" data-target="#injuryDetailModal" onclick="viewInjuryDetails(${injury.id})">보기</button></td>
                    </tr>`;
                    $('table tbody').append(row);
                });
            },
            error: function(error) {
                console.error('Error fetching injury data', error);
            }
        });
    }

    // Example function to load injury details into the modal
    window.viewInjuryDetails = function(id) {
        // Placeholder URL, replace with your actual API endpoint
        $.ajax({
            url: `/api/injuries/${id}`,
            method: 'GET',
            success: function(injury) {
                $('#registerNumber').val(injury.registerNumber);
                $('#name').val(injury.name);
                $('#position').val(injury.position);
                $('#injuryDate').val(injury.injuryDate);
                $('#injuryPart').val(injury.injuryPart);
                $(`input[name="severity"][value="${injury.severity}"]`).prop('checked', true);
                $('#doctor').val(injury.doctor);
                $('#memo').val(injury.memo);
                $('#recoveryPeriod').val(injury.recoveryPeriod);
            },
            error: function(error) {
                console.error('Error fetching injury details', error);
            }
        });
    }
});
