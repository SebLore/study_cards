let questions = [];
let currentIndex = 0;
let score = 0;
let results = [];
let answerStats = {};

// Load questions from JSON file
fetch("questions.json")
  .then((response) => response.json())
  .then((data) => {
    questions = data;
    initializeAnswerStats();
    filterAndSortQuestions();
    loadQuestion();
  })
  .catch((error) => console.error("Error loading questions:", error));

// Initialize answer statistics
function initializeAnswerStats() {
  questions.forEach((question) => {
    answerStats[question.nr] = { correct: 0, incorrect: 0 };
  });
}

// Filter and sort questions
function filterAndSortQuestions() {
  questions.sort((a, b) => {
    const aCorrect = answerStats[a.nr].correct;
    const bCorrect = answerStats[b.nr].correct;
    return aCorrect - bCorrect;
  });

  const minCorrect = answerStats[questions[0].nr].correct;
  questions = questions.filter(
    (q) => answerStats[q.nr].correct <= minCorrect + 3
  );

  questions = questions.slice(0, 20);
}

// Load current question
function loadQuestion() {
  const container = document.getElementById("question-container");
  const questionElement = document.getElementById("question");
  const topicElement = document.getElementById("topic");
  const optionsElement = document.getElementById("options");
  const hintElement = document.getElementById("hint");
  const question = questions[currentIndex];

  container.classList.remove("hidden");
  document.getElementById("results-container").classList.add("hidden");

  questionElement.textContent = question.question;
  topicElement.textContent = question.topic;
  hintElement.textContent = question.hint;
  hintElement.classList.add("hidden");

  optionsElement.innerHTML = "";

  if (question.type === "multiple") {
    question.options.forEach((option) => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = option;
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(option));
      optionsElement.appendChild(label);
      optionsElement.appendChild(document.createElement("br"));
    });
  } else if (question.type === "multiple-single") {
    question.options.forEach((option) => {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "single-choice";
      radio.value = option;
      label.appendChild(radio);
      label.appendChild(document.createTextNode(option));
      optionsElement.appendChild(label);
      optionsElement.appendChild(document.createElement("br"));
    });
  } else {
    const input = document.createElement("input");
    input.type = "text";
    input.id = "user-answer";
    input.placeholder = "Enter your answer here";

    // key listener
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        submitAnswer();
      }
    });

    optionsElement.appendChild(input);
  }
}

// Show the hint
function showHint() {
  document.getElementById("hint").style.opacity = 1;
}

// Submit the answer
function submitAnswer() {
  const question = questions[currentIndex];
  const userAnswer =
    question.type === "multiple"
      ? Array.from(document.querySelectorAll("#options input:checked")).map(
          (checkbox) => checkbox.value
        )
      : question.type === "multiple-single"
      ? document.querySelector("#options input:checked")?.value
      : document.getElementById("user-answer").value.trim();

  const correct =
    question.type === "multiple"
      ? userAnswer.every((ans) => question.answer.includes(ans)) &&
        userAnswer.length === question.answer.length
      : question.type === "multiple-single"
      ? question.answer.includes(userAnswer)
      : question.answer.includes(userAnswer);

  const partialScore =
    question.type === "multiple"
      ? userAnswer.filter((ans) => question.answer.includes(ans)).length /
        question.answer.length
      : correct
      ? 1
      : 0;

  results.push({
    nr: question.nr,
    correct,
    partialScore,
  });

  score += partialScore;

  // Update answer statistics
  if (correct) {
    answerStats[question.nr].correct++;
  } else {
    answerStats[question.nr].incorrect++;
  }

  currentIndex++;
  if (currentIndex < questions.length) {
    loadQuestion();
  } else {
    showResults();
    saveAnswerStats();
  }
}

// Show results
function showResults() {
  const container = document.getElementById("results-container");
  const resultsList = document.getElementById("results");
  const finalScore = document.getElementById("final-score");

  container.classList.remove("hidden");
  document.getElementById("question-container").classList.add("hidden");
  document.getElementById("buttons-container").classList.add("hidden");

  resultsList.innerHTML = results
    .map((result, index) => {
      return `<li>Q${index + 1}: ${result.partialScore.toFixed(2)}/1 ${
        result.correct
          ? '<span style="color: green;">✓</span>'
          : '<span style="color: red;">✗</span>'
      }</li>`;
    })
    .join("");

  finalScore.textContent = `Final Score: ${score.toFixed(2)}/${
    questions.length
  }`;
}

// Save answer statistics to a file
function saveAnswerStats() {
  const statsBlob = new Blob([JSON.stringify(answerStats, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(statsBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "answerStats.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Toggle dark mode
document.body.classList.toggle(
  "dark-mode",
  window.matchMedia("(prefers-color-scheme: dark)").matches
);

function skipQuestion() {
  // Set the current question's score to 0
  results.push({
    nr: questions[currentIndex].nr,
    correct: false,
    partialScore: 0,
  });

  currentIndex++;
  if (currentIndex < questions.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

function loadNextQuestion() {
  // Implement the logic to load the next question
  // This is a placeholder function, you need to implement the actual logic
  console.log("Loading next question");
  // Example: Update the question, topic, options, and reset the hint
  document.getElementById("question").innerText = "Next question text";
  document.getElementById("topic").innerText = "Next topic";
  document.getElementById("options").innerHTML = ""; // Update with new options
  document.getElementById("hint").classList.add("hidden");
  document.getElementById("buttons-container").classList.remove("hidden");
}
