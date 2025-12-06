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
        this.isSubmitting = false; // Flag untuk mencegah double submit
        this.isSubmittingQuestion = false; // Flag untuk question submit

        this.setupEventListeners();
        this.setupQuestionsModal();
        this.loadData();
    }

    setupEventListeners() {
        // Add level button
        const addBtn = document.getElementById("addLevelBtn");
        if (addBtn) {
            addBtn.addEventListener("click", () => {
                this.openModal("Tambah Level");
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById("cancelBtn");
        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
                this.closeModal();
            });
        }

        // Search functionality
        let searchTimeout;
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filterData(e.target.value);
                }, 300);
            });
        }

        // Modal close buttons
        document.querySelectorAll(".close").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.closeModal();
            });
        });

        // Form submission - PASTIKAN HANYA 1 EVENT LISTENER
        const form = document.getElementById("levelForm");
        if (form) {
            // Remove existing listeners (jika ada)
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

            // Add single event listener
            newForm.addEventListener("submit", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleSubmit(e);
            });
        }
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

        // Question form submit - PASTIKAN HANYA 1 EVENT LISTENER
        const questionForm = document.getElementById("questionForm");
        if (questionForm) {
            const newQuestionForm = questionForm.cloneNode(true);
            questionForm.parentNode.replaceChild(newQuestionForm, questionForm);

            newQuestionForm.addEventListener("submit", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleQuestionSubmit();
            });

            // Re-attach cancel button listener
            const cancelQuestionBtn =
                newQuestionForm.querySelector("#cancelQuestionBtn");
            if (cancelQuestionBtn) {
                cancelQuestionBtn.addEventListener("click", () => {
                    this.closeQuestionModal();
                });
            }
        }
    }

    async loadData() {
        try {
            const response = await this.api.get(this.endpoint);
            this.data = response.data || response;
            this.renderData(this.data);
        } catch (error) {
            console.error("Error loading levels:", error);
            this.renderEmptyState("Gagal memuat data level");
        }
    }

    renderData(levels) {
        const tableBody = document.getElementById("levelsTableBody");

        if (!levels || levels.length === 0) {
            this.renderEmptyState("Tidak ada level ditemukan");
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
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                        <i class="fas fa-layer-group mr-2"></i>
                        Level ${item.id}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${
                        item.title || item.name
                    }</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <i class="fas fa-question-circle mr-1"></i>
                        ${item.questions_count || 0} soal
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    ${new Date(item.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center gap-2">
                        <button 
                            class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer" 
                            onclick="levelsManager.viewQuestions(${item.id})"
                            title="Kelola Pertanyaan">
                            <i class="fas fa-tasks mr-1"></i>
                            <span class="hidden sm:inline">Kelola Pertanyaan</span>
                            <span class="sm:hidden">Soal</span>
                        </button>
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors cursor-pointer" 
                            onclick="levelsManager.editItem(${item.id})"
                            title="Edit Level">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer" 
                            onclick="levelsManager.deleteItem(${item.id})"
                            title="Hapus Level">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
            )
            .join("");
    }

    renderEmptyState(message = "Tidak ada level ditemukan") {
        const tableBody = document.getElementById("levelsTableBody");

        const emptyStateHtml = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center">
                    <div class="text-gray-500">
                        <i class="fas fa-layer-group text-4xl mb-4 text-gray-300"></i>
                        <p>${message}</p>
                    </div>
                </td>
            </tr>
        `;

        if (tableBody) {
            tableBody.innerHTML = emptyStateHtml;
        }
    }

    filterData(searchTerm) {
        const filteredData = this.data.filter(
            (item) =>
                (item.title || item.name)
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                String(item.id).includes(searchTerm)
        );
        this.renderData(filteredData);
    }

    editItem(id) {
        const item = this.data.find((l) => l.id === id);
        if (!item) return;

        document.getElementById("levelId").value = item.id;
        document.getElementById("levelNumber").value = item.id;
        document.getElementById("title").value = item.title || item.name;
        document.getElementById("imageUrl").value = item.image_url || "";
        document.getElementById("description").value = item.description || "";

        this.openModal("Edit Level");
    }

    async handleSubmit(e) {
        // Prevent double submission
        if (this.isSubmitting) {
            console.log("Sudah dalam proses submit, melewati...");
            return;
        }

        this.isSubmitting = true;

        const levelId = document.getElementById("levelId").value;
        const levelNumber = document.getElementById("levelNumber").value;
        const title = document.getElementById("title").value.trim();
        const imageUrl = document.getElementById("imageUrl").value.trim();
        const description = document.getElementById("description").value.trim();

        // Disable submit button
        const submitBtn = document.getElementById("saveBtn");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';
        }

        // Validasi client-side
        if (!levelNumber) {
            this.showToast("Nomor level wajib diisi", "error");
            this.isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan Level";
            }
            return;
        }

        if (!title) {
            this.showToast("Judul wajib diisi", "error");
            this.isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan Level";
            }
            return;
        }

        if (!imageUrl) {
            this.showToast("URL Gambar wajib diisi", "error");
            this.isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan Level";
            }
            return;
        }

        if (!description) {
            this.showToast("Deskripsi wajib diisi", "error");
            this.isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan Level";
            }
            return;
        }

        const data = {
            name: `Level ${levelNumber}`,
            title: title,
            image_url: imageUrl,
            description: description,
        };

        try {
            if (levelId) {
                await this.api.put(`${this.endpoint}/${levelId}`, data);
                this.showToast("Level berhasil diperbarui", "success");
            } else {
                await this.api.post(this.endpoint, data);
                this.showToast("Level berhasil ditambahkan", "success");
            }
            this.closeModal();
            await this.loadData();
        } catch (error) {
            console.error("Submit error:", error);
            this.showToast("Gagal menyimpan level: " + error.message, "error");
        } finally {
            this.isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan Level";
            }
        }
    }
    async deleteItem(id) {
        if (
            !confirm(
                "Apakah Anda yakin? Ini juga akan menghapus semua pertanyaan di level ini!"
            )
        )
            return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            this.showToast("Level berhasil dihapus", "success");
            this.loadData();
        } catch (error) {
            this.showToast("Gagal menghapus level: " + error.message, "error");
        }
    }

    // Questions Management
    async viewQuestions(levelId) {
        this.currentLevelId = levelId;
        const level = this.data.find((l) => l.id === levelId);

        document.getElementById("levelTitle").textContent = level
            ? level.title || level.name
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
            console.error("Error loading questions:", error);
            document.getElementById("questionsContainer").innerHTML =
                '<p class="text-red-500 text-center py-4">Gagal memuat pertanyaan</p>';
        }
    }

    renderQuestions() {
        const container = document.getElementById("questionsContainer");

        if (this.questions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div class="text-gray-400 mb-4">
                        <i class="fas fa-question-circle text-6xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Belum Ada Pertanyaan</h3>
                    <p class="text-gray-500 mb-4">Mulai tambahkan pertanyaan untuk level ini</p>
                    <button onclick="levelsManager.openQuestionModal()" class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">
                        <i class="fas fa-plus mr-2"></i>
                        Tambah Pertanyaan Pertama
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.questions
            .map(
                (q, index) => `
            <div class="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
                                Soal #${index + 1}
                            </span>
                        </div>
                        <h4 class="text-base font-semibold text-gray-900 mb-3">${
                            q.question
                        }</h4>
                        ${
                            q.image_url
                                ? `
                            <div class="mb-3">
                                <img src="${q.image_url}" alt="Gambar Soal" class="w-32 h-32 object-cover rounded-lg border-2 border-gray-200">
                            </div>
                        `
                                : ""
                        }
                        <div class="flex items-center gap-2">
                            <i class="fas fa-check-circle text-green-500"></i>
                            <p class="text-sm font-medium text-gray-700">
                                Jawaban: <span class="text-green-700 font-semibold">${
                                    q.correct_option || q.correct_answer
                                }</span>
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 ml-4">
                        <button 
                            class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors cursor-pointer" 
                            onclick="levelsManager.editQuestion(${q.id})"
                            title="Edit Pertanyaan">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer" 
                            onclick="levelsManager.deleteQuestion(${q.id})"
                            title="Hapus Pertanyaan">
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
            title.textContent = "Edit Pertanyaan";
        } else {
            title.textContent = "Tambah Pertanyaan";
            document.getElementById("questionForm").reset();
            document.getElementById("questionId").value = "";
            document.getElementById("questionLevelId").value =
                this.currentLevelId;
        }

        modal.classList.remove("hidden");
    }

    editQuestion(questionId) {
        const question = this.questions.find((q) => q.id === questionId);
        if (!question) return;

        document.getElementById("questionId").value = question.id;
        document.getElementById("questionLevelId").value = this.currentLevelId;
        document.getElementById("questionText").value = question.question;
        document.getElementById("questionImageUrl").value =
            question.image_url || "";
        document.getElementById("correctAnswer").value =
            question.correct_option || question.correct_answer;

        this.openQuestionModal(questionId);
    }

    async handleQuestionSubmit() {
        // Prevent double submission
        if (this.isSubmittingQuestion) {
            console.log("Sudah dalam proses submit pertanyaan, melewati...");
            return;
        }

        this.isSubmittingQuestion = true;

        const questionId = document.getElementById("questionId").value;
        const levelId = this.currentLevelId;
        const questionText = document
            .getElementById("questionText")
            .value.trim();
        const imageUrl = document
            .getElementById("questionImageUrl")
            .value.trim();
        const correctAnswer = document
            .getElementById("correctAnswer")
            .value.trim();

        // Disable submit button
        const submitBtn = document.getElementById("saveQuestionBtn");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';
        }

        // Validasi
        if (!questionText) {
            this.showToast("Pertanyaan wajib diisi", "error");
            this.isSubmittingQuestion = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan";
            }
            return;
        }

        if (!imageUrl) {
            this.showToast("URL Gambar wajib diisi", "error");
            this.isSubmittingQuestion = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan";
            }
            return;
        }

        if (!correctAnswer) {
            this.showToast("Jawaban benar wajib diisi", "error");
            this.isSubmittingQuestion = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan";
            }
            return;
        }

        const data = {
            question: questionText,
            image_url: imageUrl,
            correct_option: correctAnswer,
            options: [correctAnswer],
        };

        try {
            if (questionId) {
                await this.api.put(
                    `/quiz/levels/${levelId}/questions/${questionId}`,
                    data
                );
                this.showToast("Pertanyaan berhasil diperbarui", "success");
            } else {
                await this.api.post(`/quiz/levels/${levelId}/questions`, data);
                this.showToast("Pertanyaan berhasil ditambahkan", "success");
            }

            this.closeQuestionModal();
            await this.loadQuestions();
            await this.loadData();
        } catch (error) {
            console.error("Submit question error:", error);
            this.showToast(
                "Gagal menyimpan pertanyaan: " + error.message,
                "error"
            );
        } finally {
            this.isSubmittingQuestion = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan";
            }
        }
    }

    async deleteQuestion(questionId) {
        if (!confirm("Apakah Anda yakin ingin menghapus pertanyaan ini?"))
            return;

        try {
            await this.api.delete(
                `/quiz/levels/${this.currentLevelId}/questions/${questionId}`
            );
            this.showToast("Pertanyaan berhasil dihapus", "success");
            await this.loadQuestions();
            await this.loadData();
        } catch (error) {
            this.showToast(
                "Gagal menghapus pertanyaan: " + error.message,
                "error"
            );
        }
    }

    openModal(title) {
        const modal = document.getElementById("levelModal");
        document.getElementById("modalTitle").textContent = title;

        if (title === "Tambah Level") {
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
        this.isSubmitting = false;
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
        this.isSubmittingQuestion = false;
    }

    showToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 shadow-lg ${
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
