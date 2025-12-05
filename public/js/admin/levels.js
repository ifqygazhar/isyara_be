class LevelsManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/quiz/levels",
            tableBodyId: "levelsTableBody",
            cardContainerId: "levelsCardContainer",
            modalId: "levelModal",
            formId: "levelForm",
        });

        this.currentLevelId = null;
        this.questions = [];

        this.setupEventListeners();
        this.setupQuestionsModal();
        this.loadData();
    }

    setupEventListeners() {
        // Add level button
        document
            .getElementById("addLevelBtn")
            ?.addEventListener("click", () => {
                this.openModal("Add Level");
            });

        // Cancel button
        document.getElementById("cancelBtn")?.addEventListener("click", () => {
            this.closeModal();
        });

        // Search functionality
        let searchTimeout;
        document
            .getElementById("searchInput")
            ?.addEventListener("input", (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filterData(e.target.value);
                }, 300);
            });

        // Modal close buttons
        document.querySelectorAll(".close").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.closeModal();
            });
        });

        // Form submission
        document
            .getElementById("levelForm")
            ?.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleSubmit(e);
            });
    }

    setupQuestionsModal() {
        // Close questions modal
        document
            .querySelector(".close-questions")
            ?.addEventListener("click", () => {
                this.closeQuestionsModal();
            });

        // Close question form modal
        document
            .querySelector(".close-question")
            ?.addEventListener("click", () => {
                this.closeQuestionModal();
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
                this.closeQuestionModal();
            });

        // Question form submit
        document
            .getElementById("questionForm")
            ?.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleQuestionSubmit();
            });
    }

    async loadData() {
        try {
            const response = await this.api.get(this.endpoint);
            this.data = response.data || response;
            this.renderData(this.data);
        } catch (error) {
            console.error("Error loading levels:", error);
            this.renderEmptyState("Error loading levels");
        }
    }

    renderData(levels) {
        const tableBody = document.getElementById("levelsTableBody");
        const cardContainer = document.getElementById("levelsCardContainer");

        if (!levels || levels.length === 0) {
            this.renderEmptyState("No levels found");
            return;
        }

        // Desktop table rows
        tableBody.innerHTML = levels
            .map(
                (item) => `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                    item.id
                }</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Level ${item.urutan || item.level_number}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${item.nama_level || item.title}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                        class="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition" 
                        onclick="levelsManager.viewQuestions(${item.id})">
                        <i class="fas fa-question-circle mr-1"></i>
                        ${item.questions_count || 0} Questions
                    </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(item.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center gap-2">
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors" 
                            onclick="levelsManager.editItem(${item.id})"
                            title="Edit Level">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors" 
                            onclick="levelsManager.deleteItem(${item.id})"
                            title="Delete Level">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
            )
            .join("");

        // Mobile cards
        if (cardContainer) {
            cardContainer.innerHTML = levels
                .map(
                    (item) => `
                <div class="border-b border-gray-200 p-4 hover:bg-gray-50 transition">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    Level ${item.urutan || item.level_number}
                                </span>
                                <span class="text-xs text-gray-500">ID: ${
                                    item.id
                                }</span>
                            </div>
                            <p class="text-lg font-semibold text-gray-900 mb-2">${
                                item.nama_level || item.title
                            }</p>
                            <div class="flex items-center gap-4 mb-3">
                                <button 
                                    class="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition" 
                                    onclick="levelsManager.viewQuestions(${
                                        item.id
                                    })">
                                    <i class="fas fa-question-circle mr-1"></i>
                                    ${item.questions_count || 0} Questions
                                </button>
                            </div>
                            <p class="text-xs text-gray-400">
                                Created: ${new Date(
                                    item.created_at
                                ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                            <div class="flex items-center gap-2 mt-3">
                                <button 
                                    onclick="levelsManager.editItem(${
                                        item.id
                                    })" 
                                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition">
                                    <i class="fas fa-edit mr-1"></i>
                                    Edit
                                </button>
                                <button 
                                    onclick="levelsManager.deleteItem(${
                                        item.id
                                    })" 
                                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-red-600 hover:bg-red-700 transition">
                                    <i class="fas fa-trash mr-1"></i>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `
                )
                .join("");
        }
    }

    renderEmptyState(message = "No levels found") {
        const tableBody = document.getElementById("levelsTableBody");
        const cardContainer = document.getElementById("levelsCardContainer");

        const emptyStateHtml = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-layer-group text-4xl mb-4 text-gray-300"></i>
                <p>${message}</p>
            </div>
        `;

        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4">
                        ${emptyStateHtml}
                    </td>
                </tr>
            `;
        }

        if (cardContainer) {
            cardContainer.innerHTML = emptyStateHtml;
        }
    }

    filterData(searchTerm) {
        const filteredData = this.data.filter(
            (item) =>
                (item.nama_level || item.title)
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                String(item.urutan || item.level_number).includes(searchTerm)
        );
        this.renderData(filteredData);
    }

    editItem(id) {
        const item = this.data.find((l) => l.id === id);
        if (!item) return;

        document.getElementById("levelId").value = item.id;
        document.getElementById("namaLevel").value =
            item.nama_level || item.title;
        document.getElementById("deskripsi").value =
            item.deskripsi || item.description || "";
        document.getElementById("urutan").value =
            item.urutan || item.level_number;

        this.openModal("Edit Level");
    }

    async handleSubmit(e) {
        const levelId = document.getElementById("levelId").value;
        const data = {
            nama_level: document.getElementById("namaLevel").value,
            deskripsi: document.getElementById("deskripsi").value,
            urutan: parseInt(document.getElementById("urutan").value),
        };

        try {
            if (levelId) {
                await this.api.put(`${this.endpoint}/${levelId}`, data);
                this.showToast("Level updated successfully", "success");
            } else {
                await this.api.post(this.endpoint, data);
                this.showToast("Level created successfully", "success");
            }
            this.closeModal();
            this.loadData();
        } catch (error) {
            this.showToast("Failed to save level: " + error.message, "error");
        }
    }

    async deleteItem(id) {
        if (
            !confirm(
                "Are you sure? This will also delete all questions in this level!"
            )
        )
            return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            this.showToast("Level deleted successfully", "success");
            this.loadData();
        } catch (error) {
            this.showToast("Failed to delete level: " + error.message, "error");
        }
    }

    // Questions Management
    async viewQuestions(levelId) {
        this.currentLevelId = levelId;
        const level = this.data.find((l) => l.id === levelId);

        document.getElementById("levelTitle").textContent = level
            ? level.nama_level || level.title
            : "Level";
        document.getElementById("questionsModal").classList.remove("hidden");
        document.body.style.overflow = "hidden";

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
            this.showToast(
                "Failed to load questions: " + error.message,
                "error"
            );
            document.getElementById("questionsContainer").innerHTML =
                '<p class="text-red-500 text-center py-4">Failed to load questions</p>';
        }
    }

    renderQuestions() {
        const container = document.getElementById("questionsContainer");

        if (this.questions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-question-circle text-4xl mb-4 text-gray-300"></i>
                    <p>No questions yet. Click "Add Question" to create one.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.questions
            .map(
                (q) => `
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h4 class="text-lg font-semibold text-gray-900 mb-2">${
                            q.teks_pertanyaan || q.question
                        }</h4>
                        <div class="grid grid-cols-2 gap-2 mb-3">
                            <div class="text-sm text-gray-600"><strong>A:</strong> ${
                                q.opsi_a || "N/A"
                            }</div>
                            <div class="text-sm text-gray-600"><strong>B:</strong> ${
                                q.opsi_b || "N/A"
                            }</div>
                            <div class="text-sm text-gray-600"><strong>C:</strong> ${
                                q.opsi_c || "N/A"
                            }</div>
                            <div class="text-sm text-gray-600"><strong>D:</strong> ${
                                q.opsi_d || "N/A"
                            }</div>
                        </div>
                        <p class="text-sm font-medium text-green-700">
                            <strong>Correct Answer:</strong> ${
                                q.jawaban_benar || q.correct_answer
                            }
                        </p>
                        ${
                            q.video_url
                                ? `
                            <div class="mt-2 flex items-center gap-2 text-sm text-blue-600">
                                <i class="fas fa-video"></i>
                                <span>Video attached</span>
                            </div>
                        `
                                : ""
                        }
                    </div>
                    <div class="flex items-center gap-2 ml-4">
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors" 
                            onclick="levelsManager.editQuestion(${q.id})"
                            title="Edit Question">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors" 
                            onclick="levelsManager.deleteQuestion(${q.id})"
                            title="Delete Question">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `
            )
            .join("");
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

        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    editQuestion(questionId) {
        const question = this.questions.find((q) => q.id === questionId);
        if (!question) return;

        document.getElementById("questionId").value = question.id;
        document.getElementById("teksPertanyaan").value =
            question.teks_pertanyaan || question.question;
        document.getElementById("opsiA").value = question.opsi_a || "";
        document.getElementById("opsiB").value = question.opsi_b || "";
        document.getElementById("opsiC").value = question.opsi_c || "";
        document.getElementById("opsiD").value = question.opsi_d || "";
        document.getElementById("jawabanBenar").value =
            question.jawaban_benar || question.correct_answer;
        document.getElementById("videoUrl").value = question.video_url || "";

        this.openQuestionModal(questionId);
    }

    async handleQuestionSubmit() {
        const questionId = document.getElementById("questionId").value;
        const levelId = this.currentLevelId;

        const data = {
            teks_pertanyaan: document.getElementById("teksPertanyaan").value,
            opsi_a: document.getElementById("opsiA").value,
            opsi_b: document.getElementById("opsiB").value,
            opsi_c: document.getElementById("opsiC").value,
            opsi_d: document.getElementById("opsiD").value,
            jawaban_benar: document.getElementById("jawabanBenar").value,
            video_url: document.getElementById("videoUrl").value || null,
        };

        try {
            if (questionId) {
                await this.api.put(
                    `/quiz/levels/${levelId}/questions/${questionId}`,
                    data
                );
                this.showToast("Question updated successfully", "success");
            } else {
                await this.api.post(`/quiz/levels/${levelId}/questions`, data);
                this.showToast("Question created successfully", "success");
            }

            this.closeQuestionModal();
            await this.loadQuestions();
            await this.loadData(); // Refresh question count
        } catch (error) {
            this.showToast(
                "Failed to save question: " + error.message,
                "error"
            );
        }
    }

    async deleteQuestion(questionId) {
        if (!confirm("Are you sure you want to delete this question?")) return;

        try {
            await this.api.delete(
                `/quiz/levels/${this.currentLevelId}/questions/${questionId}`
            );
            this.showToast("Question deleted successfully", "success");
            await this.loadQuestions();
            await this.loadData(); // Refresh question count
        } catch (error) {
            this.showToast(
                "Failed to delete question: " + error.message,
                "error"
            );
        }
    }

    openModal(title) {
        const modal = document.getElementById("levelModal");
        document.getElementById("modalTitle").textContent = title;

        if (title === "Add Level") {
            document.getElementById("levelForm").reset();
            document.getElementById("levelId").value = "";
        }

        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    closeModal() {
        const modal = document.getElementById("levelModal");
        modal.classList.add("hidden");
        document.body.style.overflow = "";
    }

    closeQuestionsModal() {
        const modal = document.getElementById("questionsModal");
        modal.classList.add("hidden");
        document.body.style.overflow = "";
        this.currentLevelId = null;
    }

    closeQuestionModal() {
        const modal = document.getElementById("questionModal");
        modal.classList.add("hidden");
        document.getElementById("questionForm").reset();
    }

    showToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
            type === "success"
                ? "bg-green-500"
                : type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
        }`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize
let levelsManager;
document.addEventListener("DOMContentLoaded", () => {
    levelsManager = new LevelsManager();
});
