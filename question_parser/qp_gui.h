// GUI wrapper for the question parser

#include <string>
#include <unordered_map>
#include <functional>
#include <array>
#include <string_view>

#include "question_parser.h"



namespace question_parser
{
    class QuestionParserGUI
    {
    static constexpr std::array<std::pair<std::string_view, >, 8> commands = {{
        {"topic", 1},
        {"exit", 0},
        {"print", 1},
        {"help", 0},
        {"print_all", 0},
        {"print_topics", 0},
        {"save", 0},
        {"load", 0}
        }
    };
    public:
        QuestionParserGUI() = default;
        void Run();
        
        void MainMenu();

        // file I/O
        bool LoadFromFile(const std::string &filename);
        bool SaveToJSON()const;

        // handling functions
        void HandleTopic(const std::string &topic);

        // prints and GUI
        void PrintTopicQuestions(const std::string &topic) const;
        void PrintAllTopics()const;
        void PrintAllQuestions()const;
        
        
        // helper functions
        std::string GetFormattedTopic(const std::string &topic)const;
        std::string GetFormattedQuestion(const std::string &topic, size_t index)const;
    private:
        std::string TakeInputStr();
        void TakeQuestions(const std::string &topic);
        void PrintHelp()const;
        void PrintCommands()const;


        QuestionParser m_qp;
    };
}