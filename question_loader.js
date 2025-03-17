class QuestionLoader {
  constructor() {
    this.questions = [];
    this.currentQuestion = 0;
  }

  async loadQuestions(path) {
    const response = await fetch(path);
    const data = await response.json();
    this.questions = data;
  }

  getCurrentQuestion() {
    return this.questions[this.currentQuestion];
  }

  nextQuestion() {
    this.currentQuestion++;
  }

  isFinished() {
    return this.currentQuestion >= this.questions.length;
  }

  addQuestion(question) {
    this.questions.push(question);
  }
}

class Question {
  constructor(id, text, answers, correctAnswer, type) {
    this.id = id;
    this.text = text;
    this.answers = answers;
    this.correctAnswer = correctAnswer;
    this.type = type;
  }
}

function formatQuestion(question) {
  let formattedQuestion = `<h2>${question.text}</h2>`;
  formattedQuestion += '<ul>';
  for (let i = 0; i < question.answers.length; i++) {
  formattedQuestion += `<li><input type="radio" name="answer" value="${i}"> ${question.answers[i]}</li>`;
  }
  formattedQuestion += '</ul>';
  return formattedQuestion;
}
