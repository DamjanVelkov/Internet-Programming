// Quiz questions and correct answers (can be replaced with your own questions)
const questions = [
    {
        question: "For how many years did the Hundred Years War last?",
        options: ["50 years", "100 years", "116 years", "124 years"],
        answer: "116 years"
    },
    {
        question: "Which country makes Panama Hats?",
        options: ["Panama", "Ecuador", "Colombia", "Mexico"],
        answer: "Ecuador"
    },
    {
        question: "From which animal do we get catgut?",
        options: ["Cats", "Dogs", "Sheep", "Cows"],
        answer: "Sheep"
    },
    {
        question: "In which month of the year is the Oktoberfest held?",
        options: ["October", "August", "September", "November"],
        answer: "September"
    },
    {
        question: "In which month of the year did the October Revolution happen?",
        options: ["October", "August", "September", "November"],
        answer: "November"
    },
    {
        question: "What is a camel's hair brush made of?",
        options: ["Camel hair", "Squirrel fur", "Horse hair", "Pig bristles"],
        answer: "Squirrel fur"
    },
    {
        question: "The Canary Islands in the Pacific are named after what animal?",
        options: ["Cat", "Bird", "Dog", "Horse"],
        answer: "Dog"
    },
    {
        question: "What was King George VI's first name?",
        options: ["George", "Albert", "Charles", "John"],
        answer: "Albert"
    },
    {
        question: "Where are Chinese gooseberries from?",
        options: ["China", "New Zealand", "Australia", "Japan"],
        answer: "New Zealand"
    },
    {
        question: "What is the color of the black box in a commercial airplane?",
        options: ["Black", "Orange", "Yellow", "Red"],
        answer: "Orange"
    },
    {
        question: "Who wrote Mozart's 3rd Symphony?",
        options: ["Mozart", "Salieri", "Bach", "Abel"],
        answer: "Abel"
    },
    {
        question: "How long did the Thirty Years War last?",
        options: ["28 years", "30 years", "33 years", "37 years"],
        answer: "30 years"
    }
];

const quizContainer = document.getElementById("quiz-container");
const resultsContainer = document.getElementById("results");
const submitButton = document.getElementById("submit-button");

// Function to display quiz questions and options
function displayQuizQuestions() {
    quizContainer.innerHTML = ''; // Clear existing questions
    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        
        questionDiv.innerHTML = `
            <p>${index + 1}. ${question.question}</p>
            <div class="options">
                ${question.options.map((option, i) => `
                    <div class="option">
                        <input type="radio" id="q${index}o${i}" name="q${index}" value="${option}">
                        <label for="q${index}o${i}">${option}</label>
                        <span class="feedback-icon"></span>
                    </div>
                `).join('')}
            </div>
        `;
        
        quizContainer.appendChild(questionDiv);
    });
}

// Function to calculate user's score
function calculateScore() {
    let score = 0;
    questions.forEach((question, index) => {
        const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
        if (selectedOption && selectedOption.value === question.answer) {
            score++;
        }
    });
    return score;
}

// Function to show quiz results
function showResults() {
    const score = calculateScore();
    const total = questions.length;
    const percentage = (score / total) * 100;
    
    // Show feedback for each question
    questions.forEach((question, index) => {
        const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
        const options = document.querySelectorAll(`input[name="q${index}"]`);
        
        options.forEach(option => {
            const optionDiv = option.parentElement;
            if (option.value === question.answer) {
                optionDiv.classList.add('correct');
                optionDiv.querySelector('.feedback-icon').innerHTML = '&#10004;'; // Checkmark
            } else if (option === selectedOption) {
                optionDiv.classList.add('incorrect');
                optionDiv.querySelector('.feedback-icon').innerHTML = '&#10008;'; // X mark
            }
            option.disabled = true; // Disable all options after submission
        });
    });
    
    // Show score and replace submit button with retry button
    resultsContainer.innerHTML = `Your score: ${score}/${total} (${percentage.toFixed(2)}%)`;
    const submitButton = document.getElementById('submit-button');
    const retryButton = document.createElement('button');
    retryButton.id = 'retry-button';
    retryButton.textContent = 'Retry Quiz';
    retryButton.addEventListener('click', resetQuiz);
    submitButton.parentNode.replaceChild(retryButton, submitButton);

    // Scroll to results
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
    });
}

function resetQuiz() {
    // Smooth scroll to top first
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Reset quiz after a small delay to ensure smooth scroll
    setTimeout(() => {
        const retryButton = document.getElementById('retry-button');
        const submitButton = document.createElement('button');
        submitButton.id = 'submit-button';
        submitButton.textContent = 'Submit Answers';
        submitButton.addEventListener('click', showResults);
        retryButton.parentNode.replaceChild(submitButton, retryButton);
        resultsContainer.innerHTML = '';
        displayQuizQuestions();
    }, 100);
}

// Event listener for submit button click
submitButton.addEventListener("click", showResults);

// Initial function call to display quiz questions when the page loads
displayQuizQuestions();