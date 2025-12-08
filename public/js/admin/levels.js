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
        this.isSubmitting = false;
        this.isSubmittingQuestion = false;

        // Image mode untuk Level dan Question
        this.levelImageMode = "url";
        this.questionImageMode = "url";
        this.selectedLevelImageFile = null;
        this.selectedQuestionImageFile = null;

        this.setupEventListeners();
        this.setupImageUpload();
        this.setupQuestionsModal();
        this.loadData();
    }

    setupEventListeners() {
        const addBtn = document.getElementById("addLevelBtn");
        if (addBtn) {
            addBtn.addEventListener("click", () => {
                this.openModal("Tambah Level");
            });
        }

        const cancelBtn = document.getElementById("cancelBtn");
        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
                this.closeModal();
            });
        }

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

        document.querySelectorAll(".close").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.closeModal();
            });
        });

        const form = document.getElementById("levelForm");
        if (form) {
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            newForm.addEventListener("submit", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleSubmit(e);
            });
        }
    }

    setupImageUpload() {
        // Level Image Upload Tabs
        const uploadTabBtn = document.getElementById("uploadTabBtn");
        const urlTabBtn = document.getElementById("urlTabBtn");
        const uploadTab = document.getElementById("uploadTab");
        const urlTab = document.getElementById("urlTab");

        uploadTabBtn?.addEventListener("click", () => {
            this.levelImageMode = "upload";
            uploadTabBtn.classList.add("bg-indigo-50", "text-indigo-600");
            uploadTabBtn.classList.remove("bg-white", "text-gray-700");
            urlTabBtn.classList.remove("bg-indigo-50", "text-indigo-600");
            urlTabBtn.classList.add("bg-white", "text-gray-700");
            uploadTab.classList.remove("hidden");
            urlTab.classList.add("hidden");
        });

        urlTabBtn?.addEventListener("click", () => {
            this.levelImageMode = "url";
            urlTabBtn.classList.add("bg-indigo-50", "text-indigo-600");
            urlTabBtn.classList.remove("bg-white", "text-gray-700");
            uploadTabBtn.classList.remove("bg-indigo-50", "text-indigo-600");
            uploadTabBtn.classList.add("bg-white", "text-gray-700");
            urlTab.classList.remove("hidden");
            uploadTab.classList.add("hidden");
        });

        // Level File Upload
        const imageFile = document.getElementById("imageFile");
        imageFile?.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    this.showToast("Ukuran file maksimal 2MB", "error");
                    e.target.value = "";
                    return;
                }
                this.selectedLevelImageFile = file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById("previewImg").src = e.target.result;
                    document
                        .getElementById("imagePreview")
                        .classList.remove("hidden");
                };
                reader.readAsDataURL(file);
            }
        });

        document
            .getElementById("removeImageBtn")
            ?.addEventListener("click", () => {
                this.selectedLevelImageFile = null;
                document.getElementById("imageFile").value = "";
                document.getElementById("imagePreview").classList.add("hidden");
            });

        // Level URL Preview
        const imageUrl = document.getElementById("imageUrl");
        let urlTimeout;
        imageUrl?.addEventListener("input", (e) => {
            clearTimeout(urlTimeout);
            urlTimeout = setTimeout(() => {
                const url = e.target.value.trim();
                if (url) {
                    document.getElementById("urlPreviewImg").src = url;
                    document
                        .getElementById("urlImagePreview")
                        .classList.remove("hidden");
                } else {
                    document
                        .getElementById("urlImagePreview")
                        .classList.add("hidden");
                }
            }, 500);
        });
    }

    setupQuestionsModal() {
        document
            .querySelector(".close-questions")
            ?.addEventListener("click", () => {
                this.closeQuestionsModal();
            });

        document
            .querySelector(".close-question")
            ?.addEventListener("click", () => {
                this.closeQuestionModal();
            });

        document
            .getElementById("addQuestionBtn")
            ?.addEventListener("click", () => {
                this.openQuestionModal();
            });

        document
            .getElementById("cancelQuestionBtn")
            ?.addEventListener("click", () => {
                this.closeQuestionModal();
            });

        const questionForm = document.getElementById("questionForm");
        if (questionForm) {
            const newQuestionForm = questionForm.cloneNode(true);
            questionForm.parentNode.replaceChild(newQuestionForm, questionForm);

            newQuestionForm.addEventListener("submit", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleQuestionSubmit();
            });

            const cancelQuestionBtn =
                newQuestionForm.querySelector("#cancelQuestionBtn");
            if (cancelQuestionBtn) {
                cancelQuestionBtn.addEventListener("click", () => {
                    this.closeQuestionModal();
                });
            }
        }

        // Question Image Upload Tabs
        this.setupQuestionImageUpload();
    }

    setupQuestionImageUpload() {
        const uploadTabBtn = document.getElementById("questionUploadTabBtn");
        const urlTabBtn = document.getElementById("questionUrlTabBtn");
        const uploadTab = document.getElementById("questionUploadTab");
        const urlTab = document.getElementById("questionUrlTab");

        uploadTabBtn?.addEventListener("click", () => {
            this.questionImageMode = "upload";
            uploadTabBtn.classList.add("bg-indigo-50", "text-indigo-600");
            uploadTabBtn.classList.remove("bg-white", "text-gray-700");
            urlTabBtn.classList.remove("bg-indigo-50", "text-indigo-600");
            urlTabBtn.classList.add("bg-white", "text-gray-700");
            uploadTab.classList.remove("hidden");
            urlTab.classList.add("hidden");
        });

        urlTabBtn?.addEventListener("click", () => {
            this.questionImageMode = "url";
            urlTabBtn.classList.add("bg-indigo-50", "text-indigo-600");
            urlTabBtn.classList.remove("bg-white", "text-gray-700");
            uploadTabBtn.classList.remove("bg-indigo-50", "text-indigo-600");
            uploadTabBtn.classList.add("bg-white", "text-gray-700");
            urlTab.classList.remove("hidden");
            uploadTab.classList.add("hidden");
        });

        // Question File Upload
        const imageFile = document.getElementById("questionImageFile");
        imageFile?.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    this.showToast("Ukuran file maksimal 2MB", "error");
                    e.target.value = "";
                    return;
                }
                this.selectedQuestionImageFile = file;
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById("questionPreviewImg").src =
                        e.target.result;
                    document
                        .getElementById("questionImagePreview")
                        .classList.remove("hidden");
                };
                reader.readAsDataURL(file);
            }
        });

        document
            .getElementById("removeQuestionImageBtn")
            ?.addEventListener("click", () => {
                this.selectedQuestionImageFile = null;
                document.getElementById("questionImageFile").value = "";
                document
                    .getElementById("questionImagePreview")
                    .classList.add("hidden");
            });

        // Question URL Preview
        const imageUrl = document.getElementById("questionImageUrl");
        let urlTimeout;
        imageUrl?.addEventListener("input", (e) => {
            clearTimeout(urlTimeout);
            urlTimeout = setTimeout(() => {
                const url = e.target.value.trim();
                if (url) {
                    document.getElementById("questionUrlPreviewImg").src = url;
                    document
                        .getElementById("questionUrlImagePreview")
                        .classList.remove("hidden");
                } else {
                    document
                        .getElementById("questionUrlImagePreview")
                        .classList.add("hidden");
                }
            }, 500);
        });
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
                <td class="px-6 py-4 hidden md:table-cell">
                    ${
                        item.image_url
                            ? `<img src="${item.image_url}" alt="${item.title}" class="w-16 h-16 object-cover rounded-lg">`
                            : `<div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <i class="fas fa-layer-group text-gray-400"></i>
                        </div>`
                    }
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
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center">
                    <div class="text-gray-500">
                        <i class="fas fa-layer-group text-4xl mb-4 text-gray-300"></i>
                        <p>${message}</p>
                    </div>
                </td>
            </tr>
        `;
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
        document.getElementById("description").value = item.description || "";

        // Reset image fields
        this.selectedLevelImageFile = null;
        document.getElementById("imageFile").value = "";
        document.getElementById("imagePreview").classList.add("hidden");

        if (item.image_url) {
            document.getElementById("imageUrl").value = item.image_url;
            document.getElementById("urlPreviewImg").src = item.image_url;
            document
                .getElementById("urlImagePreview")
                .classList.remove("hidden");
        } else {
            document.getElementById("imageUrl").value = "";
            document.getElementById("urlImagePreview").classList.add("hidden");
        }

        this.openModal("Edit Level");
    }

    async handleSubmit(e) {
        if (this.isSubmitting) return;
        this.isSubmitting = true;

        const submitBtn = document.getElementById("saveBtn");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';
        }

        try {
            const levelId = document.getElementById("levelId").value;
            const levelNumber = document.getElementById("levelNumber").value;
            const title = document.getElementById("title").value.trim();
            const description = document
                .getElementById("description")
                .value.trim();

            // Validasi
            if (!levelNumber) {
                this.showToast("Nomor level wajib diisi", "error");
                this.resetSubmitButton(submitBtn);
                return;
            }

            if (!title) {
                this.showToast("Judul wajib diisi", "error");
                this.resetSubmitButton(submitBtn);
                return;
            }

            if (!description) {
                this.showToast("Deskripsi wajib diisi", "error");
                this.resetSubmitButton(submitBtn);
                return;
            }

            // SELALU gunakan FormData untuk support file upload
            const formData = new FormData();
            formData.append("name", `Level ${levelNumber}`);
            formData.append("title", title);
            formData.append("description", description);

            // Handle image based on mode
            if (
                this.levelImageMode === "upload" &&
                this.selectedLevelImageFile
            ) {
                formData.append("image", this.selectedLevelImageFile);
            } else if (this.levelImageMode === "url") {
                const imageUrl = document
                    .getElementById("imageUrl")
                    .value.trim();
                if (imageUrl) {
                    formData.append("image_url", imageUrl);
                }
            }

            if (levelId) {
                await this.api.post(`${this.endpoint}/${levelId}`, formData);
                this.showToast("Level berhasil diperbarui", "success");
            } else {
                // CREATE
                await this.api.post(this.endpoint, formData);
                this.showToast("Level berhasil ditambahkan", "success");
            }

            this.closeModal();
            await this.loadData();
        } catch (error) {
            console.error("Submit error:", error);
            this.showToast("Gagal menyimpan level: " + error.message, "error");
        } finally {
            this.resetSubmitButton(submitBtn);
        }
    }

    resetSubmitButton(btn) {
        this.isSubmitting = false;
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Simpan Level";
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

            // Reset question image fields
            this.selectedQuestionImageFile = null;
            document.getElementById("questionImageFile").value = "";
            document
                .getElementById("questionImagePreview")
                .classList.add("hidden");
            document.getElementById("questionImageUrl").value = "";
            document
                .getElementById("questionUrlImagePreview")
                .classList.add("hidden");
        }

        modal.classList.remove("hidden");
    }

    editQuestion(questionId) {
        const question = this.questions.find((q) => q.id === questionId);
        if (!question) return;

        document.getElementById("questionId").value = question.id;
        document.getElementById("questionLevelId").value = this.currentLevelId;
        document.getElementById("questionText").value = question.question;
        document.getElementById("correctAnswer").value =
            question.correct_option || question.correct_answer;

        // Reset question image fields
        this.selectedQuestionImageFile = null;
        document.getElementById("questionImageFile").value = "";
        document.getElementById("questionImagePreview").classList.add("hidden");

        if (question.image_url) {
            document.getElementById("questionImageUrl").value =
                question.image_url;
            document.getElementById("questionUrlPreviewImg").src =
                question.image_url;
            document
                .getElementById("questionUrlImagePreview")
                .classList.remove("hidden");
        } else {
            document.getElementById("questionImageUrl").value = "";
            document
                .getElementById("questionUrlImagePreview")
                .classList.add("hidden");
        }

        this.openQuestionModal(questionId);
    }

    async handleQuestionSubmit() {
        if (this.isSubmittingQuestion) return;
        this.isSubmittingQuestion = true;

        const submitBtn = document.getElementById("saveQuestionBtn");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';
        }

        try {
            const questionId = document.getElementById("questionId").value;
            const levelId = this.currentLevelId;
            const questionText = document
                .getElementById("questionText")
                .value.trim();
            const correctAnswer = document
                .getElementById("correctAnswer")
                .value.trim();

            // Validasi
            if (!questionText) {
                this.showToast("Pertanyaan wajib diisi", "error");
                this.resetQuestionSubmitButton(submitBtn);
                return;
            }

            if (!correctAnswer) {
                this.showToast("Jawaban benar wajib diisi", "error");
                this.resetQuestionSubmitButton(submitBtn);
                return;
            }

            // SELALU gunakan FormData untuk support file upload
            const formData = new FormData();
            formData.append("question", questionText);
            formData.append("correct_option", correctAnswer);
            // FIX: Kirim array sebagai JSON string
            formData.append("options[]", correctAnswer);

            // Handle image based on mode
            if (
                this.questionImageMode === "upload" &&
                this.selectedQuestionImageFile
            ) {
                formData.append("image", this.selectedQuestionImageFile);
            } else if (this.questionImageMode === "url") {
                const imageUrl = document
                    .getElementById("questionImageUrl")
                    .value.trim();
                if (imageUrl) {
                    formData.append("image_url", imageUrl);
                }
            }

            if (questionId) {
                await this.api.post(
                    `/quiz/levels/${levelId}/questions/${questionId}`,
                    formData
                );
                this.showToast("Pertanyaan berhasil diperbarui", "success");
            } else {
                // CREATE
                await this.api.post(
                    `/quiz/levels/${levelId}/questions`,
                    formData
                );
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
            this.resetQuestionSubmitButton(submitBtn);
        }
    }

    resetQuestionSubmitButton(btn) {
        this.isSubmittingQuestion = false;
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Simpan Pertanyaan";
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

            // Reset level image fields
            this.selectedLevelImageFile = null;
            document.getElementById("imageFile").value = "";
            document.getElementById("imagePreview").classList.add("hidden");
            document.getElementById("imageUrl").value = "";
            document.getElementById("urlImagePreview").classList.add("hidden");
        }

        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    closeModal() {
        const modal = document.getElementById("levelModal");
        modal.classList.add("hidden");
        document.body.style.overflow = "";
        this.isSubmitting = false;
        this.selectedLevelImageFile = null;
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
        this.isSubmittingQuestion = false;
        this.selectedQuestionImageFile = null;
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
        setTimeout(() => toast.remove(), 3000);
    }
}

// Initialize
let levelsManager;
document.addEventListener("DOMContentLoaded", () => {
    levelsManager = new LevelsManager();
});
