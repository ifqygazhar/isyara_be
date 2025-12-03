// Levels & Questions Management
class LevelsManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/quiz/levels",
            tableBodyId: "levelsTableBody",
            modalId: "levelModal",
            formId: "levelForm",
        });

        this.currentLevelId = null;
        this.questions = [];

        document
            .getElementById("addLevelBtn")
            ?.addEventListener("click", () => {
                this.openModal("Add Level");
            });

        document.getElementById("cancelBtn")?.addEventListener("click", () => {
            this.closeModal();
        });

        // Questions Modal
        this.setupQuestionsModal();
    }

    setupQuestionsModal() {
        const questionsModal = document.getElementById("questionsModal");
        const questionModal = document.getElementById("questionModal");

        // Close questions modal
        document
            .querySelector(".close-questions")
            ?.addEventListener("click", () => {
                questionsModal.classList.remove("show");
            });

        // Close question form modal
        document
            .querySelector(".close-question")
            ?.addEventListener("click", () => {
                questionModal.classList.remove("show");
                document.getElementById("questionForm").reset();
            });

        // Add question button
        document
            .getElementById("addQuestionBtn")
            ?.addEventListener("click", () => {
                this.openQuestionModal();
            });

        // Cancel question button
        document
            .getElementById("cancelQuestionBtn")
            ?.addEventListener("click", () => {
                questionModal.classList.remove("show");
                document.getElementById("questionForm").reset();
            });

        // Question form submit
        document
            .getElementById("questionForm")
            ?.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleQuestionSubmit();
            });
    }

    searchFields(item) {
        return [item.level_number, item.title];
    }

    renderRow(item) {
        const questionCount = item.questions_count || 0;
        return `
            <tr>
                <td>${item.id}</td>
                <td><span class="badge badge-info">Level ${
                    item.level_number
                }</span></td>
                <td><strong>${item.title}</strong></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="levelsManager.viewQuestions(${
                        item.id
                    })">
                        ${questionCount} Questions
                    </button>
                </td>
                <td>${utils.formatDate(item.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="levelsManager.editItem(${
                        item.id
                    })">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="levelsManager.deleteItem(${
                        item.id
                    })">Delete</button>
                </td>
            </tr>
        `;
    }

    editItem(id) {
        const item = this.data.find((l) => l.id === id);
        if (!item) return;

        document.getElementById("levelId").value = item.id;
        document.getElementById("levelNumber").value = item.level_number;
        document.getElementById("title").value = item.title;

        this.openModal("Edit Level");
    }

    async handleSubmit(e) {
        const levelId = document.getElementById("levelId").value;
        const data = {
            level_number: parseInt(
                document.getElementById("levelNumber").value
            ),
            title: document.getElementById("title").value,
        };

        try {
            if (levelId) {
                await this.api.put(`${this.endpoint}/${levelId}`, data);
                utils.showToast("Level updated successfully");
            } else {
                await this.api.post(this.endpoint, data);
                utils.showToast("Level created successfully");
            }
            this.closeModal();
            this.loadData();
        } catch (error) {
            utils.showToast("Failed to save level: " + error.message, "error");
        }
    }

    async deleteItem(id) {
        if (
            !utils.confirm(
                "Are you sure? This will also delete all questions in this level!"
            )
        )
            return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            utils.showToast("Level deleted successfully");
            this.loadData();
        } catch (error) {
            utils.showToast(
                "Failed to delete level: " + error.message,
                "error"
            );
        }
    }

    // Questions Management
    async viewQuestions(levelId) {
        this.currentLevelId = levelId;
        const level = this.data.find((l) => l.id === levelId);

        document.getElementById("levelTitle").textContent = level
            ? level.title
            : "Level";
        document.getElementById("questionsModal").classList.add("show");

        await this.loadQuestions();
    }

    async loadQuestions() {
        try {
            const response = await this.api.get(
                `/quiz/levels/${this.currentLevelId}/questions`
            );
            this.questions = response.data || response;
            this.renderQuestions();
        } catch (error) {
            utils.showToast(
                "Failed to load questions: " + error.message,
                "error"
            );
            document.getElementById("questionsContainer").innerHTML =
                '<p class="text-danger">Failed to load questions</p>';
        }
    }

    renderQuestions() {
        const container = document.getElementById("questionsContainer");

        if (this.questions.length === 0) {
            container.innerHTML =
                '<p class="text-muted">No questions yet. Click "Add Question" to create one.</p>';
            return;
        }

        container.innerHTML = `
            <div class="questions-list">
                ${this.questions
                    .map(
                        (q) => `
                    <div class="question-item">
                        <div class="question-content">
                            <div class="question-image">
                                ${utils.renderImage(q.image_url, q.question)}
                            </div>
                            <div class="question-details">
                                <h4>${q.question}</h4>
                                <p><strong>Correct Answer:</strong> ${
                                    q.correct_answer
                                }</p>
                            </div>
                        </div>
                        <div class="question-actions">
                            <button class="btn btn-sm btn-warning" onclick="levelsManager.editQuestion(${
                                q.id
                            })">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="levelsManager.deleteQuestion(${
                                q.id
                            })">Delete</button>
                        </div>
                    </div>
                `
                    )
                    .join("")}
            </div>
        `;
    }

    openQuestionModal(questionId = null) {
        const modal = document.getElementById("questionModal");
        const title = document.getElementById("questionModalTitle");

        if (questionId) {
            title.textContent = "Edit Question";
        } else {
            title.textContent = "Add Question";
            document.getElementById("questionForm").reset();
            document.getElementById("questionId").value = "";
        }

        document.getElementById("questionLevelId").value = this.currentLevelId;
        modal.classList.add("show");
    }

    editQuestion(questionId) {
        const question = this.questions.find((q) => q.id === questionId);
        if (!question) return;

        document.getElementById("questionId").value = question.id;
        document.getElementById("questionLevelId").value = this.currentLevelId;
        document.getElementById("questionText").value = question.question;
        document.getElementById("imageUrl").value = question.image_url;
        document.getElementById("correctAnswer").value =
            question.correct_answer;

        this.openQuestionModal(questionId);
    }

    async handleQuestionSubmit() {
        const questionId = document.getElementById("questionId").value;
        const levelId = this.currentLevelId;

        const data = {
            question: document.getElementById("questionText").value,
            image_url: document.getElementById("imageUrl").value,
            correct_answer: document.getElementById("correctAnswer").value,
        };

        try {
            if (questionId) {
                await this.api.put(
                    `/quiz/levels/${levelId}/questions/${questionId}`,
                    data
                );
                utils.showToast("Question updated successfully");
            } else {
                await this.api.post(`/quiz/levels/${levelId}/questions`, data);
                utils.showToast("Question created successfully");
            }

            document.getElementById("questionModal").classList.remove("show");
            document.getElementById("questionForm").reset();
            await this.loadQuestions();
            await this.loadData(); // Refresh question count
        } catch (error) {
            utils.showToast(
                "Failed to save question: " + error.message,
                "error"
            );
        }
    }

    async deleteQuestion(questionId) {
        if (!utils.confirm("Are you sure you want to delete this question?"))
            return;

        try {
            await this.api.delete(
                `/quiz/levels/${this.currentLevelId}/questions/${questionId}`
            );
            utils.showToast("Question deleted successfully");
            await this.loadQuestions();
            await this.loadData(); // Refresh question count
        } catch (error) {
            utils.showToast(
                "Failed to delete question: " + error.message,
                "error"
            );
        }
    }
}

// Initialize
let levelsManager;
document.addEventListener("DOMContentLoaded", () => {
    levelsManager = new LevelsManager();
});
