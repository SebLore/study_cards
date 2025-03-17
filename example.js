// Example courses
const courses = [
    {
        "id": "AA1111",
        "name": "Example Course",
        "topics": [
            {
                "id": "AA1111-colors",
                "name": "Colors",
                "questions": [
                    {
                        "id": "AA111-topic1-q1",
                        "text": "Which of the following is not considered a primary color in the RGB color model?",
                        "answers": ["yellow"],
                        "options": ["red", "blue", "yellow", "green"],
                        "hint": "RGB primary colors are different from paint colors.",
                        "type": "multiple-single"
                    },
                    {
                        "id": "AA111-topic1-q2",
                        "text": "The hexadecimal RGB code for red is #FF0000, true or false?",
                        "answers": ["true"],
                        "hint": "FF represents the maximum value in an 8-bit color system.",
                        "options": ["true", "false"],
                        "type": "true-false"
                    },
                    {
                        "id": "AA111-topic1-q3",
                        "text": "Which of the following pairs are considered complementary colors?",
                        "options": ["red and blue", "green and yellow", "purple and orange", "red and cyan"],
                        "answers": ["red and cyan"],
                        "hint": "Complementary colors are opposite each other on the color wheel.",
                        "type": "multiple-multiple"
                    }
                ]
            }
        ]
    }
];

// Load courses into dropdown
function loadCourses() {
    let courseSelect = document.getElementById("courseSelect");
    courseSelect.innerHTML = "<option disabled selected>Select a course</option>";
    courseSelect.id = "courseSelect";

    courses.forEach(course => {
        let option = document.createElement("option");
        option.value = course.id;
        option.innerText = course.name;
        courseSelect.appendChild(option);
        console.log("Appending course option", option);
    });

    courseSelect.addEventListener("change", function () {
        loadTopics(this.value);
    });
}

// Function to Load Topics
function loadTopics(courseId) {
    let course = courses.find(c => c.id === courseId);
    console.log("Course:", course);
    let topicSelector = document.getElementById("topicSelect");
    topicSelector.innerHTML = "<option>Select a topic</option>";

    course.topics.forEach(topic => {
        let option = document.createElement("option");
        option.value = topic.id;
        option.innerText = topic.name;
        topicSelector.appendChild(option);
    });

    topicSelector.addEventListener("change", function () {
        loadQuestions(this.value);
    });
}

// Function to Load Questions
function loadQuestions(topicId) {
    let course = courses.find(c => c.topics.some(t => t.id === topicId));
    let topic = course.topics.find(t => t.id === topicId);
    
currentTopicQuestions = topic.questions;
    currentQuestionIndex = 0;
    correctAnswersCount = 0;

    updateProgress();
    showQuestion();
}

// Show Question One at a Time
function showQuestion() {
    let questionContainer = document.getElementById("questionContainer");
    questionContainer.innerHTML = "";

    if (currentQuestionIndex < currentTopicQuestions.length) {
        questionContainer.appendChild(renderQuestion(currentTopicQuestions[currentQuestionIndex]));
    } else {
        showResults();
    }
}

// Function to Render Questions
function renderQuestion(question) {
    let container = document.createElement("div");
    container.classList.add("question-container");

    let questionText = document.createElement("p");
    questionText.innerText = question.text;
    container.appendChild(questionText);

    let optionsContainer = document.createElement("div");
    optionsContainer.id = `questionContainer`;
    optionsContainer.classList.add("options-container");

    let inputs = [];

    switch (question.type) {
        case "multiple-single":
            question.options.forEach(option => {
                let label = document.createElement("label");
                let input = document.createElement("input");
                input.type = "radio";
                input.name = `question-${question.id}`;
                input.value = option;
                inputs.push(input);

                label.appendChild(input);
                label.appendChild(document.createTextNode(option));
                optionsContainer.appendChild(label);
            });
            break;

        case "multiple-multiple":
            question.options.forEach(option => {
                let label = document.createElement("label");
                let input = document.createElement("input");
                input.type = "checkbox";
                input.name = `question-${question.id}`;
                input.value = option;
                inputs.push(input);

                label.appendChild(input);
                label.appendChild(document.createTextNode(option));
                optionsContainer.appendChild(label);
            });
            break;

        case "true-false":
            question.options.forEach(option => {
                let label = document.createElement("label");
                let input = document.createElement("input");
                input.type = "radio";
                input.name = `question-${question.id}`;
                input.value = option;
                inputs.push(input);

                label.appendChild(input);
                label.appendChild(document.createTextNode(option));
                optionsContainer.appendChild(label);
            });
            break;

        default:
            console.warn(`Unknown question type: ${question.type}`);
    }

    container.appendChild(optionsContainer);

    // Hint Button
    let hintButton = document.createElement("button");
    hintButton.innerText = "Show Hint";
    hintButton.addEventListener("click", function () {
        hintText.style.display = "block";
    });

    // Hint Text
    let hintText = document.createElement("p");
    hintText.classList.add("hint");
    hintText.innerText = `Hint: ${question.hint}`;
    hintText.style.display = "none";

    container.appendChild(hintButton);
    container.appendChild(hintText);

    // Submit Button
    let submitButton = document.createElement("button");
    submitButton.innerText = "Submit Answer";
    submitButton.addEventListener("click", function () {
        checkAnswer(question, inputs);
    });

    let resultDisplay = document.createElement("p");
    resultDisplay.classList.add("result");

    container.appendChild(questionText);
    container.appendChild(optionsContainer);
    container.appendChild(hintButton);
    container.appendChild(submitButton);
    container.appendChild(resultDisplay);

    return container;
}

// Function to Check Answer
function checkAnswer(question, inputs) {
    let userAnswers = inputs.filter(input => input.checked).map(input => input.value);
    let correctAnswers = question.answers;

    let resultDisplay = inputs[0].closest(".question-container").querySelector(".result");

    if (arraysEqual(userAnswers, correctAnswers)) {
        resultDisplay.innerText = "✅ Correct!";
        resultDisplay.style.color = "green";
    } else {
        resultDisplay.innerText = "❌ Incorrect. Try again!";
        resultDisplay.style.color = "red";
    }
}

// Helper function to compare arrays
function arraysEqual(a, b) {
    return a.length === b.length && a.every(value => b.includes(value));
}


function resetQuestions() {
    let questionContainer = document.getElementById("questionContainer");
    questionContainer.innerHTML = "";
}

// Initializing
document.addEventListener("DOMContentLoaded", function () {
    loadCourses();

    document.addEventListener("courseSelect", "change", function () {
        loadTopics(this.value);
    });

    document.addEventListener("topicSelect", "change", function () {
        resetQuestions();
        loadQuestions(this.value);
    });
});