#include <sstream>
#include <fstream>
#include <exception>

#include "question_parser.h"

#ifdef __DEBUG_ENABLED__
#include <iostream>

#define PRINT_DEBUG(x) std::cout << x << std::endl
#define PRINT_DEBUG_ERR(x) std::cerr << x << std::endl
#else
#define PRINT_DEBUG(x)
#define PRINT_DEBUG_ERR(x)
#endif

// run main menu loop

bool question_parser::QuestionParser::LoadFromJSON(const std::string &path)
{
    if (path.substr(path.find_last_of(".") + 1) != "json")
    {
        PRINT_DEBUG_ERR("Invalid file format. Must be .json");
        return false;
    }

    std::ifstream file(path);
    if (!file.is_open())
    {
        PRINT_DEBUG_ERR("Failed to open file.");
        return false;
    }

    // load file contents to string
    std::string contents;
    file.seekg(0, std::ios::end);
    contents.resize(file.tellg());
    file.seekg(0, std::ios::beg);
    file.read(&contents[0], contents.size());
    file.close();

    return true;
}

bool question_parser::QuestionParser::AddCourse(const std::string &id, const std::string &name)
{
    if (m_courses.find(id) != m_courses.end())
    {
        PRINT_DEBUG_ERR("Course already exists.");
        return false;
    }
    Course newCourse;
    newCourse.id = id;
    newCourse.name = name;
    m_courses[id] = std::move(newCourse);

    return false;
}

bool question_parser::QuestionParser::RemoveCourse(const std::string &id)
{
    auto it = m_courses.find(id);
    if (it == m_courses.end())
    {
        PRINT_DEBUG_ERR("Course not found.");
        return false;
    }
    if (m_currentCourse == &it->second)
    {
        m_currentCourse = nullptr;
    }
    m_courses.erase(it);

    return true;
}

void question_parser::QuestionParser::AddQuestion(const std::string &topic, Question &&question)
{
    m_questions[m_topics[topic]].push_back(std::move(question));

    PRINT_DEBUG(std::string("Question added to topic: " + topic));
}

bool question_parser::QuestionParser::AddTopic(const std::string &topic)
{
    if (m_topics.find(topic) != m_topics.end())
    {
        PRINT_DEBUG_ERR("Topic already exists.");
        return false;
    }

    m_topics[topic] = m_questions.size();

    m_questions.push_back(std::vector<Question>{});

    PRINT_DEBUG(std::string("Topic added: " + topic));

    return true;
}

bool question_parser::QuestionParser::RemoveTopic(const std::string &topic)
{
    auto it = m_topics.find(topic);
    if (it == m_topics.end())
    {
        PRINT_DEBUG_ERR("Topic not found.");
        return false;
    }

    // if topic is not at back of vector:
    //  1. swap with back
    //  2. update index for that topic
    //  3. then pop back
    if (it->second != m_questions.size() - 1)
    {
        size_t back = m_questions.size() - 1;
        for (const auto &pair : m_topics)
        {
            if (pair.second == back)
            {
                m_topics[pair.first] = it->second;
                break;
            }
        }

        std::swap(m_questions[it->second], m_questions.back());
    }
    m_questions.pop_back();

    m_topics.erase(it);

    PRINT_DEBUG(std::string("Topic removed: " + topic));

    return true;
}

const std::unordered_map<std::string, size_t> &question_parser::QuestionParser::GetTopics() const
{
    return m_topics;
}

const std::vector<question_parser::Question> &question_parser::QuestionParser::GetQuestions(const std::string &topic) const
{
    auto it = m_topics.find(topic);
    if (it == m_topics.end())
    {
        PRINT_DEBUG_ERR("Topic not found.");
        throw std::runtime_error("Topic not found.");
    }

    if (it->second >= m_questions.size())
    {
        PRINT_DEBUG_ERR("Index out of bounds.");
        throw std::out_of_range("Index out of bounds.");
    }

    return m_questions.at(m_topics.at(it->first));
}

const std::vector<std::vector<question_parser::Question>> &question_parser::QuestionParser::GetAllQuestions() const
{
    return m_questions;
}

// takes a question struct and outputs a formatted string with information about the question
std::string question_parser::QuestionParser::FormatQuestion(const Question &question) const
{
    std::ostringstream oss{};

    oss << "Question: " << question.text << std::endl;
    oss << "Answer(s): ";
    for (const auto &answer : question.answers)
    {
        oss << answer;
        if (answer != question.answers.back())
        {
            oss << ", ";
        }
    }
    oss << "\nType: " << question.type << std::endl;
    if (!question.options.empty())
    {
        oss << "Options: ";
        for (const auto &option : question.options)
        {
            oss << option;
            // don't print space for the final one
            if (option != question.options.back())
            {
                oss << ", ";
            }
        }
        oss << std::endl;
    }
    oss << "Hint: " << question.hint << std::endl;

    return oss.str();
}

std::string question_parser::QuestionParser::FormatTopic(const std::string &topic) const
{
    if (m_topics.find(topic) == m_topics.end())
    {
        PRINT_DEBUG_ERR("Topic not found.");
        return "";
    }

    std::ostringstream oss{};
    for (const auto &question : m_questions[m_topics.at(topic)])
    {
        oss << FormatQuestion(question);
        oss << "\n";
    }
    return oss.str();
}

// save all questions in memory to .json file
bool question_parser::QuestionParser::SaveToJSON(const std::string &path) const
{
    if (path.substr(path.find_last_of(".") + 1) != "json")
    {
        PRINT_DEBUG("Invalid file format. Must be .json");
        return false;
    }

    // open file in read-write append mode
    std::fstream file("questions.json", std::ios::out | std::ios::in);

    if (!file.is_open())
    {
        PRINT_DEBUG_ERR("Failed to open file for saving.");
        return false;
    }

    file.seekg(0, std::ios::end);
    std::streampos length = file.tellg();
    if (length == 0)
    {
        file << "[\n";
    }
    else
    {
        char c;
        do
        {
            file.seekg(-1, std::ios::cur); // Move back one character
            file.get(c);
            file.seekg(-1, std::ios::cur); // Move back again to re-read correctly
        } while (std::isspace(c) && file.tellg() > 0);

        if (c == ']')
        {
            file.seekp(-1, std::ios::cur); // Move to overwrite the ']'
            file << ",\n";
        }
        else
        {
            PRINT_DEBUG_ERR("File does not end with ']', cannot append safely.");
            return false;
        }
    }

    int i = 0;
    for (const auto &[topic, index] : m_topics)
    {
        for (const auto &question : m_questions[index])
        {
            file << "{\n";
            file << "  \"id\": " << i++ << ",\n";
            file << "  \"text\": \"" << question.text << "\",\n";
            file << "  \"answers\": ";
            if (question.answers.size() == 1)
                file << "\"" << question.answers.front() << "\",\n";
            else
            {
                file << "[";
                for (const auto &answer : question.answers)
                {
                    file << "\"" << answer << "\"";
                    if (answer != question.answers.back())
                        file << ", ";
                }
                file << "],\n";
            }
            file << "  \"hint\": \"" << question.hint << "\",\n";

            // type
            file << "  \"type\": \"";
            if (question.type == MULTIPLE_CHOICE)
                file << "multiple-choice-single-answer";
            else if (question.type == MULTIPLE_ANSWER)
                file << "multiple-choice-multiple-answer";
            else if (question.type == TRUE_FALSE)
                file << "true-false";
            else if (question.type == SHORT_ANSWER)
                file << "written";
            else
                file << "UNKNOWN";
            file << "\",\n";
            if (!question.options.empty())
            {
                file << "\"options\": [";
                for (const auto &option : question.options)
                {
                    file << "\"" << option << "\"";
                    if (option != question.options.back())
                        file << ", ";
                }
                file << "]\n";
            }
            else
                file << "\n,";
            file << "}\n";
        }
    }

    // close file
    file << "]\n";
    file.close();

    return true;
}