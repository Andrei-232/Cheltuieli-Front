document.addEventListener('DOMContentLoaded', function() {
    fetch('http://127.0.0.1:5176/cheltuieli/getTotalApartments')
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-apartamente').textContent = data.totalApartments;
        });

    fetch('http://127.0.0.1:5176/cheltuieli/getTotalLocatari')
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-locatari').textContent = data.totalLocatari;
        });

    fetch('http://127.0.0.1:5176/cheltuieli/getTotalPlati')
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-plati').textContent = data.totalPlati;
        });
});
