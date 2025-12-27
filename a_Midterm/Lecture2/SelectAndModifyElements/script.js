document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('div-adder');
    const container = document.getElementById('container');

    let counter = 0;
    let colorIndex = 0;
    const colors = ['red', 'blue', 'green', 'yellow'];

    button.addEventListener('click', function() {
        const newDiv = document.createElement('div');
        counter += 1;
        const divNumber = counter;

        const textSpan = document.createElement('span');
        textSpan.textContent = `Div number ${divNumber}`;

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.className = 'close-button';

        closeButton.addEventListener('click', function() {
            newDiv.remove();
            colorIndex = (colorIndex + 1) % colors.length;
            container.style.backgroundColor = colors[colorIndex];
        });

        newDiv.className = 'dynamic-div';
        newDiv.appendChild(textSpan);
        newDiv.appendChild(closeButton);

        container.appendChild(newDiv);
    });
});