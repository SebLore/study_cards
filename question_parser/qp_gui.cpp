#include "qp_gui.h"

#include <iostream>
#include <fstream>
#include <sstream>

void question_parser::QuestionParserGUI::Run()
{
    // run until exit
    system("cls");
    std::cout << "Welcome to the question parser.\n"
              << std::endl;
    MainMenu();
}

void question_parser::QuestionParserGUI::MainMenu()
{
    bool done = false;

    std::string input;
    

    while (!done)
    {
        input.clear();

        // take input
        std::cout << "Enter command: ";
        input = TakeInputStr();

        // parse input
        std::istringstream iss(input);
        std::string command;
        iss >> command;

        if (command == commands[0])
        {
            std::string topic;
            iss >> topic;


        }
        else if (command == "exit")
        {
            done = true;
            if (SaveToJSON())
                std::cout << "Questions saved to file." << std::endl;
            else
                std::cerr << "Failed to save questions to file." << std::endl;
        }
        else if (command == "print")
        {
            std::string topic;
            iss >> topic;
            if(topic.empty())
            {
                std::cout << "Enter topic name to print: ";
                topic = TakeInputStr();
            }
            PrintTopicQuestions(topic);
        }
        else if (command == "print_all")
        {
            PrintAllQuestions();
        }
        else if (command == "print_topics")
        {
            PrintAllTopics();
        }
        else if (command == "help")
        {
            PrintHelp();
        }
        else
        {
            std::cout << "Invalid command." << " " << command << std::endl;
            std::cout << "Available commands are <topic>, <exit>, <print>, and <help>." << std::endl;
        }
    }
}

bool question_parser::QuestionParserGUI::LoadFromFile(const std::string &filename)
{
    std::ifstream file(filename);
    if (!file.is_open())
    {
        std::cerr << "Failed to open file." << std::endl;
        return false;
    }

    // load file contents to string
    std::string contents;
    file.seekg(0, std::ios::end);
    contents.resize(file.tellg());
    file.seekg(0, std::ios::beg);
    file.read(&contents[0], contents.size());

    file.close();

    // parse contents

    return true;
}

bool question_parser::QuestionParserGUI::SaveToJSON() const
{

    std::ofstream file("questions.json", std::ios::out);

    if (!file.is_open())
    {
        std::cerr << "Failed to open file." << std::endl;
        return false;
    }

    // write to file
    file << "[\n";
    for (const auto &[topic, index] : m_qp.GetTopics())
    {  
        if(index > m_qp.GetQuestions(topic).size())
        {
            std::cout << "Topic index went out of bounds: " << topic << std::endl;
            continue;
            // go to next iteration
        }
        for (const auto &question : m_qp.GetQuestions(topic))
        {
            file << "  {\n";
            file << "  \"question\": \"" << question.question << "\",\n";
            file << "  \"topic\": \"" << topic << "\",\n";
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
                file << "single";
            else if (question.type == MULTIPLE_ANSWER)
                file << "multiple";
            else if (question.type == TRUE_FALSE)
                file << "true_false";
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

void question_parser::QuestionParserGUI::HandleTopic(const std::string &topic)
{
    if (!m_qp.AddTopic(topic))
    {
        std::cerr << "Failed to add topic." << std::endl;
        return;
    }

    // take questions
    TakeQuestions(topic);
}

void question_parser::QuestionParserGUI::PrintTopicQuestions(const std::string &name) const
{
    std::string str = m_qp.FormatTopic(name);

    if(str.empty())
    {
        std::cout << "Cannot print topic: topic not found." << std::endl;
        return;
    }

    std::cout << "topic: " << name << std::endl;
    std::cout << str << std::endl;
}

void question_parser::QuestionParserGUI::PrintAllTopics() const
{
    std::cout << "All topics:" << std::endl;
    for (const auto &topic : m_qp.GetTopics())
    {
        std::cout << "topic: " << topic.first << std::endl;
    }
}

void question_parser::QuestionParserGUI::PrintAllQuestions() const
{
    std::cout << "All questions:" << std::endl;
    for (const auto &topic : m_qp.GetTopics())
    {
        std::cout << "Topic: " << topic.first << std::endl;
        for (const auto &question : m_qp.GetQuestions(topic.first))
            std::cout << " " << m_qp.FormatQuestion(question) << std::endl;

        std::endl(std::cout);
    }
}

std::string question_parser::QuestionParserGUI::TakeInputStr()
{
    std::string input;
    std::getline(std::cin, input);
    return input;
}

void question_parser::QuestionParserGUI::PrintHelp() const
{
    std::cout << "Available commands are <topic>, <exit>, <print>, and <help>." << std::endl;
    std::cout << "  topic <name> - add a new topic and take questions" << std::endl;
    std::cout << "  print <name> - print questions for a topic" << std::endl;
    std::cout << "  help - print this help message" << std::endl;
    std::cout << "  exit - save questions and exit" << std::endl;
    // to add
    // std::cout << "  load <filename> - load topics and questions from file" << std::endl;
    // std::cout << "  save <filename> - save topics and questions to file" << std::endl;
}

std::string question_parser::QuestionParserGUI::GetFormattedTopic(const std::string &topic) const
{
    return m_qp.FormatTopic(topic);
}

std::string question_parser::QuestionParserGUI::GetFormattedQuestion(const std::string &topic, size_t index) const
{
    return m_qp.FormatQuestion(m_qp.GetQuestions(topic).at(index));
}

void question_parser::QuestionParserGUI::TakeQuestions(const std::string &topic)
{
    // read questions
    system("cls");
    std::string line;
    char c = 0;

    std::cout << "Now taking questions for topic: " << topic << std::endl;
    bool done = false;
    while (!done)
    {
        line.clear();
        c = 0;

        std::cout << "Press 'Enter' to continue or type 'ESC' or '0' to exit." << std::endl;
        std::getline(std::cin, line);
        if (line == "ESC" || line == "0")
            done = true;

        else if (done == false)
        {
            Question q;

            // get question
            std::cout << "Enter question text: ";
            std::getline(std::cin, line);
            q.question = line;

            while (c < '0' || c > '3')
            {
                std::cout << "Enter number corresponding to question type \n";
                std::cout << " 0: MULTIPLE_CHOICE \n";
                std::cout << " 1: MULTIPLE_ANSWER \n";
                std::cout << " 2: TRUE_FALSE \n";
                std::cout << " 3: SHORT_ANSWER \n";
                std::cout << "Choice: ";

                c = fgetc(stdin);
                std::cin.ignore(); // reset buffer
                if (c < '0' || c > '3')
                {
                    std::cout << "Invalid type. Try again.\n"
                              << std::endl;
                    c = 0; // reset
                }
            }
            q.type = static_cast<Type>(c - '0'); // convert char to corresponding int and then to enum

            // get options
            if (q.type == MULTIPLE_ANSWER || q.type == MULTIPLE_CHOICE)
            {
                std::cout << "Enter up to 4 options or end early with 0.\n";
                int n = 4;
                for (int i = 0; i < n; i++)
                {
                    std::cout << "Option " << i + 1 << ": ";
                    std::getline(std::cin, line);
                    if (line == "0")
                    {
                        n = i;
                        i = 4;
                    }
                    else
                        q.options.push_back(line);
                }
            }
            else if (q.type == TRUE_FALSE)
            {
                q.options.push_back("True");
                q.options.push_back("False");
            }

            // prompt user to define which option is the correct answer

            if (q.type == MULTIPLE_CHOICE)
            {
                std::cout << "Options given are:";
                for (size_t i = 0; i < q.options.size(); i++)
                    std::cout << "\n"
                              << i + 1 << ": "
                              << q.options[i];
                std::cout << "\nEnter the correct answer: ";
                std::getline(std::cin, line);
                q.answers.push_back(line);
            }
            else if (q.type == MULTIPLE_ANSWER)
            {
                if (q.options.size() == 0)
                {
                    std::cout << "No options given. Please add options first." << std::endl;
                    break;
                    ;
                }
                std::cout << "Options given are:";
                for (size_t i = 0; i < q.options.size(); ++i)
                    std::cout << "\n"
                              << i + 1 << ": "
                              << q.options[i];

                std::cout << "\nEnter the correct answers, end with 0.";

                for (size_t i = 0; i < q.options.size(); i++)
                {
                    std::cout << "Enter the correct answer: ";
                    c = fgetc(stdin);
                    std::cin.ignore();
                    if (c == '0')
                        i = q.options.size();
                    else
                        q.answers.push_back(q.options.at(c - '0' - 1));
                }
            }
            else if (q.type == TRUE_FALSE)
            {
                std::cout << "Is it true or false?";
                std::cout << "  0: False" << std::endl;
                std::cout << "  1: True" << std::endl;
                std::cout << "Answer: ";
                c = fgetc(stdin);
                std::cin.ignore();
                if (c == '0')
                    q.answers.push_back("False");
                else
                    q.answers.push_back("True");
            }
            else
            {
                std::cout << "Enter the correct answer: ";
                std::getline(std::cin, line);
                q.answers.push_back(std::move(line));
            }

            // Get hint
            std::cout << "Add a hint (press Enter to skip): ";
            std::getline(std::cin, line);
            q.hint = line;

            // FINALLY
            // add question to topic
            m_qp.AddQuestion(topic, std::move(q));
        }
    }
    system("cls");
}

question_parser::QuestionParserGUI::PrintCommands() const
{
    std::cout << "Available commands: "
    for (const auto &command : commands)
    {
        std::cout << "<" << command.first << ">" << std::endl;
    }
}
