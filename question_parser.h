

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
        std::string id;
        std::string text;
        std::string hint;
        std::vector<std::string> answers;
        std::vector<std::string> options;
        Type type;
    };

    struct Topic{
        std::string id;
        std::string name;
        std::vector<Question> questions;
    };


    struct Course {
        std::string id;
        std::string name;
        std::vector<Topic> topics;
    };

    class QuestionParser
    {
    public:
        QuestionParser() = default;
        ~QuestionParser() = default;

        bool SaveToJSON(const std::string &path)const;   // save all questions in memory to .json file
        bool LoadFromJSON(const std::string &path); // load questions from .json file

        bool AddCourse(const std::string &id, const std::string &name);
        bool RemoveCourse(const std::string &id);

        
        bool AddTopic(const std::string &topic);
        bool RemoveTopic(const std::string &topic);
        const std::vector<Question> &GetTopic(const std::string &topic) const;
        bool RemoveQuestionFromTopic(const std::string &topic, size_t index);
        
        void TakeQuestions(std::string &topic);
        void AddQuestion(const std::string &topic, Question &&question);

        const std::unordered_map<std::string, size_t> &GetTopics() const;
        const std::vector<Question> &GetQuestions(const std::string &topic)const;
        const std::vector<std::vector<Question>> &GetAllQuestions() const;

        std::string FormatQuestion(const Question &question) const;
        std::string FormatTopic(const std::string &topic) const;
        std::string FormatCourse(const std::string &id) const;
    private:
        std::unordered_map<std::string, Course> m_courses;
        std::unordered_map<std::string, size_t> m_topics; // maps a topic to a string vector
        std::vector<std::vector<Question>> m_questions; // questions for each topic
        Course* m_currentCourse = nullptr;
        Topic* m_currentTopic = nullptr;
    };
}
