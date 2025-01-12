let questions = [];
let currentIndex = 0;
let score = 0;
let results = [];

// Load questions from JSON file
fetch("questions.json")
  .then((response) => response.json())
  .then((data) => {
    questions = data;
    shuffleQuestions();
    loadQuestion();
  })
  .catch((error) => console.error("Error loading questions:", error));

// Shuffle questions for randomness
function shuffleQuestions() {
  questions.sort(() => Math.random() - 0.5);
}

// Load current question
function loadQuestion() {
  const container = document.getElementById("question-container");
  const questionElement = document.getElementById("question");
  const optionsElement = document.getElementById("options");
  const hintElement = document.getElementById("hint");
  const question = questions[currentIndex];

  container.classList.remove("hidden");
  document.getElementById("results-container").classList.add("hidden");

  questionElement.textContent = question.question;
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
    optionsElement.appendChild(input);
  }
}

// Show the hint
function showHint() {
  document.getElementById("hint").classList.remove("hidden");
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

  results.push({ questionNumber: question.questionNumber, correct });

  score += correct
    ? question.type === "multiple"
      ? 1 / question.answer.length
      : 1
    : 0;

  currentIndex++;
  if (currentIndex < questions.length) {
    loadQuestion();
  } else {
    showResults();
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
    .sort((a, b) => a.questionNumber - b.questionNumber)
    .map((result) => {
      const question = questions.find(
        (q) => q.questionNumber === result.questionNumber
      );
      const score = result.correct
        ? question.type === "multiple"
          ? 1 / question.answer.length
          : 1
        : 0;
      return `<li>Q${result.questionNumber}: ${score.toFixed(2)}/1 ${
        result.correct ? "✔️" : "❌"
      }</li>`;
    })
    .join("");

  finalScore.textContent = `Final Score: ${score.toFixed(2)}`;
}

// Toggle dark mode
document.body.classList.toggle(
  "dark-mode",
  window.matchMedia("(prefers-color-scheme: dark)").matches
);
