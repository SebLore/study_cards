

#pragma once

#include <string>
#include <vector>
#include <unordered_map>

namespace question_parser
{
    namespace qp = question_parser;

    // question type
    enum Type
    {
        MULTIPLE_CHOICE,
        MULTIPLE_ANSWER,
        TRUE_FALSE,
        SHORT_ANSWER
    };

    struct Question
    {
        std::string question;
        Type type;
        std::vector<std::string> answers;
        std::vector<std::string> options;
        std::string hint;
    };

    class QuestionParser
    {
    public:
        QuestionParser() = default;
        ~QuestionParser() = default;
        bool SaveToJSON(const std::string &path)const;   // save all questions in memory to .json file
        bool LoadFromFile(const std::string &path); // load questions from .json file

        void TakeQuestions(std::string &topic);
        void AddQuestion(const std::string &topic, Question &&question);
        
        bool AddTopic(const std::string &topic);
        bool RemoveTopic(const std::string &topic);
        const std::vector<Question> &GetTopic(const std::string &topic) const;

        bool RemoveQuestionFromTopic(const std::string &topic, size_t index);

        std::unordered_map<std::string, size_t> GetTopics() const { return m_topics; }
        std::vector<Question> & GetQuestions(const std::string &topic);
        std::vector<std::vector<Question>> GetAllQuestions() const { return m_questions; }

    private:
        std::string FormatQuestion(const Question &question) const;
        std::string FormatTopic(const std::string &topic) const;

        std::unordered_map<std::string, size_t> m_topics;
        std::vector<std::vector<Question>> m_questions; // questions for each topic
    };
}
