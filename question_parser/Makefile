# Compiler
CXX = g++

# Compiler flags
CXXFLAGS = -std=c++17 -Wall -Wextra -pedantic

# Debug flags
DEBUGFLAGS = -g -D_DEBUG

# Release flags
RELEASEFLAGS = -O2

# Include directories
INCLUDES = -I.

# Source files
SRCS = main.cpp qp_gui.cpp question_parser.cpp

# Object files
OBJS = $(SRCS:.cpp=.o)

# Executable name
TARGET = question_parser

# Default target
all: $(TARGET)

# Debug target
debug: CXXFLAGS += $(DEBUGFLAGS)
debug: $(TARGET)

# Release target
release: CXXFLAGS += $(RELEASEFLAGS)
release: $(TARGET)

# Link the executable
$(TARGET): $(OBJS)
	$(CXX)  $(CXXFLAGS) $(INCLUDES) -o  $@ $^

# Compile source files into object files
%.o: %.cpp
	$(CXX) $(CXXFLAGS) $(INCLUDES) -c $< -o $@

# Clean up build files
clean:
	rm -f $(OBJS) $(TARGET)

.PHONY: all debug release clean
