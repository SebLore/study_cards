// GUI wrapper for the question parser

#include <string>

#include "question_parser.h"

namespace question_parser
{
    class QuestionParserGUI
    {
    public:
        QuestionParserGUI() = default;
        void Run();

        bool LoadFromFile(const std::string &filename);
        bool SaveToJSON()const;
    private:
        void TakeQuestions(const std::string &topic);

        QuestionParser m_qp;
    };
}