import json
import tkinter as tk
from tkinter import messagebox


def save_question(
    questions,
    topic,
    question_entry,
    answer_entries,
    hint_entry,
    question_type_var,
    correct_vars,
):
    answers = [entry.get() for entry in answer_entries]
    correct_answers = [answers[i] for i, var in enumerate(correct_vars) if var.get()]
    question_data = {
        "question": question_entry.get(),
        "answer": correct_answers,
        "hint": hint_entry.get(),
        "type": question_type_var.get(),
        "topic": topic,
        "questionNumber": len(questions) + 1,
    }
    questions.append(question_data)
    with open("questions.json", "a") as f:
        json.dump(questions, f, indent=2)
    messagebox.showinfo("Success", "Question saved to questions.json")


def main():
    root = tk.Tk()
    root.title("Question Generator")
    root.geometry("400x400")

    root.columnconfigure(0, weight=1)
    root.columnconfigure(1, weight=1)
    root.columnconfigure(2, weight=1)
    root.columnconfigure(3, weight=1)

    root.rowconfigure(0, weight=1)
    root.rowconfigure(1, weight=1)
    root.rowconfigure(2, weight=1)
    root.rowconfigure(3, weight=1)

    topic_label = tk.Label(root, text="Enter the topic:")
    topic_label.grid(row=0, column=1, columnspan=2)
    topic_entry = tk.Entry(root, width=40, exportselection=True)
    topic_entry.grid(row=1, column=1, columnspan=2)

    questions = []

    def start_new_topic():
        topic = topic_entry.get()
        if not topic:
            messagebox.showwarning("Warning", "Please enter a topic")
            return

        topic_label.grid_remove()
        topic_entry.grid_remove()

        def add_question():
            save_question(
                questions,
                topic,
                question_entry,
                answer_entries,
                hint_entry,
                question_type_var,
                correct_vars,
            )
            question_entry.delete(0, tk.END)
            for entry in answer_entries:
                entry.delete(0, tk.END)
            hint_entry.delete(0, tk.END)
            for var in correct_vars:
                var.set(False)

        def done():
            save_question(
                questions,
                topic,
                question_entry,
                answer_entries,
                hint_entry,
                question_type_var,
                correct_vars,
            )
            root.destroy()

        tk.Label(root, text="Enter the question:").grid(
            row=1, column=0, columnspan=2, pady=5
        )
        question_entry = tk.Entry(root)
        question_entry.grid(row=1, column=2, columnspan=2, pady=5)

        tk.Label(root, text="Enter the hint:").grid(
            row=2, column=0, columnspan=2, pady=5
        )
        hint_entry = tk.Entry(root)
        hint_entry.grid(row=2, column=2, columnspan=2, pady=5)

        question_type_var = tk.StringVar(value="single")
        tk.Label(root, text="Se,ect type:").grid(row=3, column=0, columnspan=2, pady=5)
        tk.Radiobutton(
            root,
            text="Multiple-Single",
            variable=question_type_var,
            value="multiple-single",
            command=update_layout,
        ).grid(row=3, column=2)
        tk.Radiobutton(
            root,
            text="Multiple-Multiple",
            variable=question_type_var,
            value="multiple-multiple",
            command=update_layout,
        ).grid(row=3, column=3)

        answer_entries = []
        correct_vars = []

        def update_layout():
            for widget in root.grid_slaves():
                if int(widget.grid_info()["row"]) > 3:
                    widget.grid_forget()

            if question_type_var.get() == "multiple-single":
                for i in range(4):
                    tk.Label(root, text=f"Answer {i+1}:").grid(
                        row=4 + i, column=0, pady=5
                    )
                    entry = tk.Entry(root)
                    entry.grid(row=4 + i, column=1, pady=5)
                    answer_entries.append(entry)
                    var = tk.BooleanVar()
                    tk.Checkbutton(root, variable=var).grid(row=4 + i, column=2, pady=5)
                    correct_vars.append(var)
            elif question_type_var.get() == "multiple-multiple":
                for i in range(4):
                    tk.Label(root, text=f"Answer {i+1}:").grid(
                        row=4 + i, column=0, pady=5
                    )
                    entry = tk.Entry(root)
                    entry.grid(row=4 + i, column=1, pady=5)
                    answer_entries.append(entry)
                    var = tk.BooleanVar()
                    tk.Checkbutton(root, variable=var).grid(row=4 + i, column=2, pady=5)
                    correct_vars.append(var)

        update_layout()

        tk.Button(root, text="New", command=add_question).grid(
            row=8, column=0, columnspan=2, pady=10
        )
        tk.Button(root, text="Done", command=done).grid(
            row=8, column=2, columnspan=2, pady=10
        )

    tk.Button(root, text="New topic", command=start_new_topic, width=20).grid(
        row=2, column=1, columnspan=2, pady=10
    )

    root.mainloop()


if __name__ == "__main__":
    main()
