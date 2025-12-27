document.addEventListener("DOMContentLoaded", () => {
    const jokeText = document.getElementById("jokeText");
    const newJokeBtn = document.getElementById("newJoke");

    async function fetchJoke() {
        jokeText.textContent = "Loading…";
        newJokeBtn.disabled = true;
        try {
            const res = await fetch("https://api.chucknorris.io/jokes/random");
            if (!res.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await res.json();
            jokeText.textContent = data.value ?? "No joke received.";
        } catch (err) {
            console.error(err);
            jokeText.textContent = "Could not load a joke. Please check your connection.";
        } finally {
            newJokeBtn.disabled = false;
        }
    }

    newJokeBtn.addEventListener("click", fetchJoke);

    // keyboard shortcut: N for new joke
    document.addEventListener("keydown", (event) => {
    if (event.key === "n" || event.key === "N") fetchJoke();
    });

    fetchJoke();
});