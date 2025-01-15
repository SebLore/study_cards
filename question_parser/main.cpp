// class for parsing questions

// pring error messages if debug
#ifdef _DEBUG
#define __DEBUG_ENABLED__
#endif

#include "qp_gui.h"
#include <memory>

#define questions_filepath "questions.json"

int main()
{
    std::unique_ptr<question_parser::QuestionParserGUI> qp_gui = std::make_unique<question_parser::QuestionParserGUI>();
    qp_gui->LoadFromFile(questions_filepath);
    qp_gui->Run();
    return 0;
}