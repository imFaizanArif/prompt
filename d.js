function consoleLog(prompt) {
    const problemDescription = `${prompt}`;

    fetch('https://promptt-lemon.vercel.app/api/solve-js-problem', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problemDescription }),
    })
        .then(response => response.json())
        .then(data => console.log('Solution:', data.solution))
        .catch(error => console.error('Error:', error));

}