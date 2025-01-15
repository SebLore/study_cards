

// compares the speed of parsing a file line by line as opposed to reading the entire file at once

#include <iostream>
#include <fstream>
#include <string>
#include <chrono>

int ReadFileLineByLine(const std::string &path, std::string &target)
{
    std::ifstream file(path);

    if (!file.is_open())
    {
        std::cerr << "Failed to open file." << std::endl;
        return -1;
    }


    std::string line;
    while (std::getline(file, line))
    {
        target += line;
    }

    file.close();

    return 0;
}

int ReadFileAtOnce(const std::string &path, std::string &target)
{
    std::ifstream file(path);

    if (!file.is_open())
    {
        std::cerr << "Failed to open file." << std::endl;
        return -1;
    }

    file.seekg(0, std::ios::end);
    target.resize(file.tellg());
    file.seekg(0, std::ios::beg);
    file.read(&target[0], target.size());

    file.close();

    return 0;
}

// generate a few big files filled with nonsense
void GenerateFiles()
{
    std::ofstream file("file1.txt");
    for (int i = 0; i < 1000000; i++)
    {
        file << "This is a line of text that is repeated many times. ";
    }
    file.close();

    file.open("file2.txt");
    for (int i = 0; i < 1000000; i++)
    {
        file << "This is a line of text that is repeated many times. ";
    }
    file.close();

    file.open("file3.txt");
    for (int i = 0; i < 1000000; i++)
    {
        file << "This is a line of text that is repeated many times. ";
    }
    file.close();
}

// test both functions n number of times, don't use threads
void TestFunctions(int n)
{
    std::string target;
    std::chrono::steady_clock::time_point start, end;

    start = std::chrono::steady_clock::now();
    for (int i = 0; i < n; i++)
    {
        ReadFileLineByLine("file1.txt", target);
    }
    end = std::chrono::steady_clock::now();
    std::cout << "ReadFileLineByLine: " << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() << "ms" << std::endl;

    target.clear();

    start = std::chrono::steady_clock::now();
    for (int i = 0; i < n; i++)
    {
        ReadFileAtOnce("file2.txt", target);
    }
    end = std::chrono::steady_clock::now();
    std::cout << "ReadFileAtOnce: " << std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count() << "ms" << std::endl;
}



int main ()
{

    GenerateFiles();

    TestFunctions(10);


    return 0;

}