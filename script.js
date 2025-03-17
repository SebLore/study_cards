let questions = [];
let question = {};
let currentIndex = 0;
let score = 0;
let courses = [];
const questionsList = [];

class Session {
  constructor() {
    this.courseid = 0;
    this.coursename = "";
    this.topicid = 0;
    this.topicname = "";
    this.index = 0;
    this.answered = 0;
    this.score = 0;
    this.results = [];
    this.questions = [];
  }
}

/**
 * This function is called when the page is loaded and is responsible for initializing the application.
 * 
 * It loads the course data from the server, populates the course picker, and sets up event listeners.
 */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    showElement("spinner");
    const data = await loadData();
    if (!data) throw new Error("Failed to load data");

    console.log("Data loaded:", data);
    courses = data.courses;
    console.log("Courses:", courses);

    let coursePicker = document.getElementById("course-picker");
    coursePicker.innerHTML = "";
    let topicPicker = document.getElementById("topic-picker");
    topicPicker.innerHTML = "";
    let startButton = document.getElementById("start-btn");


    let option = document.createElement("option");
    option.value = "0";
    option.textContent = "Select a course";
    coursePicker.appendChild(option);

    courses.forEach(course => {
      option = document.createElement("option");
      option.value = course.id;
      option.textContent = course.id + " - " + course.name;
      coursePicker.appendChild(option);
    });
    let activeCourse = 0;

    // listen for changes to the course picker. if not the default ("Select a course")
    coursePicker.addEventListener("change", () => {
      if (coursePicker.value != 0) {
        activeCourse = courses.find(c => c.id === coursePicker.value);
        console.log("Active course:", activeCourse.name);
        if (activeCourse) {
          topicPicker.innerHTML = "";
          option = document.createElement("option");
          option.value = "0";
          option.textContent = "Select a topic";
          topicPicker.appendChild(option);

          activeCourse.topics.forEach(topic => {
            let option = document.createElement("option");
            option.value = topic.id;
            option.textContent = topic.name;
            topicPicker.appendChild(option);
          });
          showElement("topic-selector", true); // topic picker is inside a div with multiple elements
        } else {
          console.error("Course not found");
        }
      }
    });



    // listen for changes to the topic picker and load the questions for 
    // the selected topic if not the default ("Select a topic")
    let activeTopic = 0;
    topicPicker.addEventListener("change", () => {
      if (topicPicker.value != 0) {
        activeTopic = activeCourse.topics.find(t => t.id === topicPicker.value);
        console.log("Active topic:", activeTopic.name);
        if (activeTopic) {
          console.log("Questions:", activeTopic.questions);
          showElement(startButton.id, true);
        } else {
          console.error("Topic not found");
        }
      }
    });

    // start a new session with the active course and topic
    startButton.addEventListener("click", () => {
      session.courseid = activeCourse.id;
      session.coursename = activeCourse.name;
      session.topicid = activeTopic.id;
      session.topicname = activeTopic.name;
      session.index = 0;
      session.answered = 0;
      session.score = 0;
      console.log("Session:", session);

      // randomly arrange the questions
      activeTopic.questions.sort(() => Math.random() - 0.5);
      session.questions = activeTopic.questions;
      setupSession(activeCourse, activeTopic, session);
      console.log("Session:", session);
      startSession(session);
    });


    let session = loadSession();
    if (session.courseid !== 0) {
      console.log("Session found:", session);
      startSession(session);
    } else {
      showElement("splash-container", true);
    }

    // start a quiz session    
    function startSession(session) {
      console.log("Starting session:", session);
      localStorage.setItem("q-session", JSON.stringify(session));

      document.getElementById("header-info").innerHTML = `<h1>${session.coursename}</h1>  <h2>${session.topicname}</h2>`;
      // hide the splash page and show the question container
      showElement("quiz-container", true);
      showElement("splash-container", false);
      showElement("spinner", false);

      // start the session, only ending when the user presses the "End Session" button or all questions have been answered
      let done = false;

      initFramework(session);
      loadQuestion(session);
    }

    // check if nav is folded
    let nav = document.getElementById("navbar");
    if (localStorage.getItem("nav-folded")) {
      nav.classList.add("folded");
    }

    showElement("spinner", false);
  } catch (error) {
    console.error("Error during initialization:", error);
    displayErrorMessage("Failed to load course data. Please try reloading the page.");
  }
});

function setupSession(course, topic, session) {
  console.log("Setting up session:", session);

  session.courseid = course.id;
  session.coursename = course.name;
  session.topicid = topic.id;
  session.topicname = topic.name;
  session.questions = topic.questions;
  session.index = session.index;
  session.answered = session.answered;
  session.score = session.score;

  console.log("Session:", session);
}

/**
 * 
 * @returns {Promise<Object>} The parsed JSON data from the server
 */
async function loadData() {
  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error loading questions:", error);
    return null;
  }
}

// saves an instance of Session to local storage

function saveSession(session) {
  localStorage.setItem("q-session", JSON.stringify(session));
}

function loadSession() {
  let session = localStorage.getItem("q-session");
  if (!session) {
    console.log("No previous session found");
    return new Session();
  }
  console.log("Loaded session:", session);
  return JSON.parse(session);

}

function showElement(id, show = true) {
  let element = document.getElementById(id);
  if (!element) {
    elementNotFound(id);
    return;
  }
  if (show) {
    console.log("Showing element:", id);
    element.classList.remove("hidden");
  } else {
    console.log("Hiding element:", id);
    element.classList.add("hidden");
  }
}

function elementNotFound(element) {
  console.log("Element with id " + element + " not found");
}

function startNewSession() {
  localStorage.removeItem("q-session");
  location.reload();
}

function toggleNav() {
  let nav = document.getElementById("navbar");
  nav.classList.toggle("folded");

  document.getElementById("nav-open").classList.toggle("hidden");

  localStorage.setItem("nav-folded", nav.classList.contains("folded"));
  // move the main content down to make space for the nav
  let main = document.getElementById("main");
  // offset by the height of nav
  main.style.marginTop = nav.clientHeight + "px";
}

function initFramework(session) {
  question = session.questions[session.index];
  console.log("Loading question:", question);

  const container = document.getElementById("question-container");
  container.classList.remove("hidden");
  const questionElement = document.getElementById("question-text");
  const hintElement = document.getElementById("hint");
  questionElement.textContent = question.text;
  hintElement.textContent = question.hint;
  hintElement.classList.add("invisible");

  const optionsElement = document.getElementById("options");

  optionsElement.innerHTML = "";

  // set up the framework
  optionsElement.innerHTML =
    `<div id="option-1" class="option">
      <input type="checkbox" id="opt-1" name="option" value="opt-1">
      <label for="opt-1">Option 1</label>
    </div>
    <div id="option-2" class="option">
      <input type="checkbox" id="opt-2" name="option" value="opt-2">
      <label for="opt-2">Option 2</label>
    </div>
    <div id="option-3" class="option">
      <input type="checkbox" id="opt-3" name="option" value="opt-3">
      <label for="opt-3">Option 3</label>
    </div>
    <div id="option-4" class="option">
      <input type="checkbox" id="opt-4" name="option" value="opt-4">
      <label for="opt-4">Option 4</label>
    </div>`;

  document.getElementById("submit-answer").addEventListener("click", () => {
    submitAnswer(session);
  });
}

function loadQuestion(session) {
  const question = session.questions[session.index];
  console.log("Loading question:", question);
  document.getElementById("question-text").textContent = question.text;
  document.getElementById("hint").textContent = question.hint;
  document.getElementById("hint").classList.add("invisible");

  switch (question.type) {
    case "multiple-choice":
      console.log("Multiple choice question");
      document.getElementById("opt-1").type = "checkbox";
      document.getElementById("opt-2").type = "checkbox";
      document.getElementById("option-3").classList.remove("hidden");
      document.getElementById("option-4").classList.remove("hidden");
      document.getElementById("opt-3").type = "checkbox";
      document.getElementById("opt-4").type = "checkbox";
      // make sure all all options are unchecked

      break;
    case "single-choice":
      console.log("Multiple single question");
      document.getElementById("opt-1").type = "radio";
      document.getElementById("opt-2").type = "radio";
      document.getElementById("opt-3").type = "radio";
      document.getElementById("opt-4").type = "radio";
      document.getElementById("option-3").classList.remove("hidden");
      document.getElementById("option-4").classList.remove("hidden");
      break;
    case "true-false":
      console.log("True/false question");
      document.getElementById("opt-1").type = "radio";
      document.getElementById("opt-2").type = "radio";
      document.getElementById("option-3").classList.add("hidden");
      document.getElementById("option-4").classList.add("hidden");

    default:
      break;
  }
  document.querySelector('label[for="opt-1"]').textContent = question.options[0];
  document.querySelector('label[for="opt-2"]').textContent = question.options[1];
  document.querySelector('label[for="opt-3"]').textContent = question.options[2];
  document.querySelector('label[for="opt-4"]').textContent = question.options[3];
  document.querySelectorAll("#options input").forEach(input => input.checked = false);
}


// Submit an answer to the current question and move to the next question
function submitAnswer(session) {
  let q = session.questions[session.index];
  console.log("Submitting answer for question:", q);

  console.log("Checking question type, options, and answer:", q.type, q.options, q.answers);
  let userAnswer;

  switch (q.type) {
    case "multiple-choice":
    case "single-choice":
      userAnswer = Array.from(document.querySelectorAll("#options input:checked")).map(input => input.value);
      break;
    case "true-false":
      userAnswer = document.querySelector("#options input:checked")?.value;
      break;
    default:
      console.error("Unknown question type:", q.type);
      break;
  }

  console.log(userAnswer);
  console.log(q.answers);


  const correct =
    q.type === "multiple-choice"
      ? userAnswer.every((ans) => q.answers.includes(ans)) &&
      userAnswer.length === q.answers.length
      : q.type === "single-choice"
        ? q.answers.includes(userAnswer)
        : q.answers.includes(userAnswer);

  const partialScore =
    q.type === "multiple-choice"
      ? userAnswer.filter((ans) => q.answers.includes(ans)).length /
      q.answers.length
      : correct
        ? 1
        : 0;

  session.results.push({
    nr: q.nr,
    correct,
    partialScore,
  });

  score += partialScore;

  // Update answer statistics
  // if (correct) {
  //   answerStats[session.index].correct++;
  // } else {
  //   answerStats[session.index].incorrect++;
  // }

  session.index++;
  if (session.index < session.questions.length) {
    loadQuestion(session);
  }
  else {
    console.log("Session complete");
    document.getElementById("question-container").classList.add("hidden");
    document.getElementById("buttons-container").classList.add("hidden");
    document.getElementById("score-container").classList.remove("hidden");

    return;
  }
  //else {
  //   showResults();
  //   saveAnswerStats();
  // }
}


function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  arr1.sort();
  arr2.sort();
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

function showHint() {
  let hint = document.getElementById("hint");
  hint.classList.remove("invisible");
}

// add listener to check box labels. if clicked, check the box
document.addEventListener("click", function (event) {
  let target = event.target;
  if (target.tagName === "LABEL") {
    let input = target.nextElementSibling;
    if (input)
      input.checked = !input.checked;
  }
});

// reset the session and reload the data
function resetSession() {
  location.reload();
}