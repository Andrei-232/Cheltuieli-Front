document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = new FormData(e.target);
    const username = form.get("username");
    const password = form.get("password");

    const data = {
        username: username,
        password: password
    };

    const response = await 
    fetch('http://127.0.0.1:5176/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
        window.location.href = "../cheltuieli/cheltuieli.html";
    } else {
        document.getElementById("errorMsg").innerText = result.message;
    }
});
