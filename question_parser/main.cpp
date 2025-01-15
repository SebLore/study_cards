// class for parsing questions

// pring error messages if debug
#ifdef _DEBUG
#define __DEBUG_ENABLED__
#endif




#include "question_parser.h"
#include <memory>

int main()
{
    // heap allocate parser
    std::unique_ptr<question_parser::QuestionParser> qp = std::make_unique<question_parser::QuestionParser>();
    
    qp->Run();
    return 0;
}