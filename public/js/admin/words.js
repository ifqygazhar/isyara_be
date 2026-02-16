class WordsManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/dictionary/words",
            tableBodyId: "wordsTableBody",
            cardContainerId: "wordsCardContainer",
            modalId: "wordModal",
            formId: "wordForm",
        });

        this.selectedImageFile = null;
        this.imageMode = "url"; // Default to URL
        this.isSubmitting = false;

        this.setupEventListeners();
        this.setupImageUpload();
        this.loadData();
    }

    setupEventListeners() {
        // Filter
        document
            .getElementById("filterBisindo")
            ?.addEventListener("change", (e) => {
                this.loadData(
                    document.getElementById("searchInput").value,
                    e.target.value,
                );
            });

        // Add button
        document.getElementById("addWordBtn")?.addEventListener("click", () => {
            this.openModal("Tambah Kata");
        });

        // Modal events
        document.getElementById("wordModal")?.addEventListener("click", (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
            if (e.target.id === "cancelBtn" || e.target.closest("#cancelBtn")) {
                this.closeModal();
            }
        });

        document.querySelectorAll(".close").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.closeModal();
            });
        });

        // Form submission
        const form = document.getElementById("wordForm");
        if (form) {
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

            newForm.addEventListener("submit", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleSubmit(e);
            });
        }

        // Search
        let searchTimeout;
        document
            .getElementById("searchInput")
            ?.addEventListener("input", (e) => {
                const filterValue =
                    document.getElementById("filterBisindo").value;
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.loadData(e.target.value, filterValue);
                }, 300);
            });
    }

    setupImageUpload() {
        // Tab switching
        const uploadTabBtn = document.getElementById("uploadTabBtn");
        const urlTabBtn = document.getElementById("urlTabBtn");
        const uploadTab = document.getElementById("uploadTab");
        const urlTab = document.getElementById("urlTab");

        uploadTabBtn?.addEventListener("click", () => {
            this.imageMode = "upload";
            uploadTabBtn.classList.add("bg-indigo-50", "text-indigo-600");
            uploadTabBtn.classList.remove("bg-white", "text-gray-700");
            urlTabBtn.classList.remove("bg-indigo-50", "text-indigo-600");
            urlTabBtn.classList.add("bg-white", "text-gray-700");
            uploadTab.classList.remove("hidden");
            urlTab.classList.add("hidden");
        });

        urlTabBtn?.addEventListener("click", () => {
            this.imageMode = "url";
            urlTabBtn.classList.add("bg-indigo-50", "text-indigo-600");
            urlTabBtn.classList.remove("bg-white", "text-gray-700");
            uploadTabBtn.classList.remove("bg-indigo-50", "text-indigo-600");
            uploadTabBtn.classList.add("bg-white", "text-gray-700");
            urlTab.classList.remove("hidden");
            uploadTab.classList.add("hidden");
        });

        // File upload
        const imageFile = document.getElementById("imageFile");
        imageFile?.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    this.showToast("Ukuran file maksimal 2MB", "error");
                    e.target.value = "";
                    return;
                }

                this.selectedImageFile = file;
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

        // Remove image
        document
            .getElementById("removeImageBtn")
            ?.addEventListener("click", () => {
                this.selectedImageFile = null;
                document.getElementById("imageFile").value = "";
                document.getElementById("imagePreview").classList.add("hidden");
            });

        // URL preview
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

    async loadData(search = "", filterBisindo = "") {
        try {
            this.showLoading();
            let url = `${this.endpoint}`;
            const params = new URLSearchParams();

            if (search) {
                params.append("search", search);
            }

            if (filterBisindo !== "") {
                params.append("is_bisindo", filterBisindo);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await this.api.get(url);
            this.data = response.data || response;
            this.renderData(this.data);
        } catch (error) {
            console.error("Error loading words:", error);
            this.renderEmptyState("Gagal memuat data kata");
        }
    }

    renderData(words) {
        const tableBody = document.getElementById("wordsTableBody");
        const cardContainer = document.getElementById("wordsCardContainer");

        if (!words || words.length === 0) {
            this.renderEmptyState("Tidak ada kata ditemukan");
            return;
        }

        // Desktop table rows
        tableBody.innerHTML = words
            .map(
                (word) => `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                    word.id
                }</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-lg font-semibold text-gray-900">${
                        word.kata
                    }</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    ${
                        word.image_url
                            ? `<img src="${word.image_url}" alt="${word.kata}" class="w-16 h-16 object-cover rounded-lg border-2 border-gray-200">`
                            : `<div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <i class="fas fa-image text-gray-400"></i>
                            </div>`
                    }
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    ${new Date(word.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center gap-2">
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors cursor-pointer" 
                            onclick="wordsManager.editItem(${word.id})"
                            title="Edit Kata">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer" 
                            onclick="wordsManager.deleteItem(${word.id})"
                            title="Hapus Kata">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `,
            )
            .join("");

        // Mobile cards
        if (cardContainer) {
            cardContainer.innerHTML = words
                .map(
                    (word) => `
                <div class="border-b border-gray-200 p-4 hover:bg-gray-50 transition">
                    <div class="flex items-start space-x-4">
                        <div class="flex-shrink-0">
                            ${
                                word.image_url
                                    ? `<img src="${word.image_url}" alt="${word.kata}" class="w-16 h-16 object-cover rounded-lg">`
                                    : `<div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <i class="fas fa-comment-alt text-2xl text-gray-400"></i>
                                </div>`
                            }
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <p class="text-lg font-semibold text-gray-900">${
                                    word.kata
                                }</p>
                                <span class="text-xs text-gray-500">ID: ${
                                    word.id
                                }</span>
                            </div>
                            <p class="text-xs text-gray-400 mt-2">
                                Dibuat: ${new Date(
                                    word.created_at,
                                ).toLocaleDateString("id-ID", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                            <div class="flex items-center gap-2 mt-3">
                                <button 
                                    onclick="wordsManager.editItem(${word.id})" 
                                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer">
                                    <i class="fas fa-edit mr-1"></i>
                                    Edit
                                </button>
                                <button 
                                    onclick="wordsManager.deleteItem(${
                                        word.id
                                    })" 
                                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-red-600 hover:bg-red-700 transition cursor-pointer">
                                    <i class="fas fa-trash mr-1"></i>
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `,
                )
                .join("");
        }
    }

    renderEmptyState(message = "Tidak ada kata ditemukan") {
        const tableBody = document.getElementById("wordsTableBody");
        const cardContainer = document.getElementById("wordsCardContainer");

        const emptyStateHtml = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-comment-alt text-4xl mb-4 text-gray-300"></i>
                <p>${message}</p>
            </div>
        `;

        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4">
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
        const filteredData = this.data.filter((word) =>
            word.kata?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        this.renderData(filteredData);
    }

    editItem(id) {
        const item = this.data.find((w) => w.id === id);
        if (!item) return;

        document.getElementById("wordId").value = item.id;
        document.getElementById("kata").value = item.kata;
        document.getElementById("is_bisindo").checked = item.is_bisindo == 1;

        // Reset image fields
        this.selectedImageFile = null;
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

        this.openModal("Edit Kata");
    }

    async handleSubmit(e) {
        if (this.isSubmitting) return;
        this.isSubmitting = true;

        const wordId = document.getElementById("wordId").value;
        const submitBtn = document.getElementById("saveBtn");

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';
        }

        try {
            const kata = document.getElementById("kata").value.trim();

            // Validasi
            if (!kata) {
                this.showToast("Kata wajib diisi", "error");
                this.resetSubmitButton(submitBtn);
                return;
            }

            // SELALU gunakan FormData untuk support file upload
            const formData = new FormData();
            formData.append("kata", kata);
            formData.append(
                "is_bisindo",
                document.getElementById("is_bisindo").checked ? 1 : 0,
            );

            // Handle image based on mode
            if (this.imageMode === "upload" && this.selectedImageFile) {
                formData.append("image", this.selectedImageFile);
            } else if (this.imageMode === "url") {
                const imageUrl = document
                    .getElementById("imageUrl")
                    .value.trim();
                if (imageUrl) {
                    formData.append("image_url", imageUrl);
                }
            }

            if (wordId) {
                await this.api.post(`${this.endpoint}/${wordId}`, formData);
                this.showToast("Kata berhasil diperbarui", "success");
            } else {
                // CREATE
                await this.api.post(this.endpoint, formData);
                this.showToast("Kata berhasil ditambahkan", "success");
            }

            this.closeModal();
            this.loadData();
        } catch (error) {
            console.error("Submit error:", error);
            if (error.message.includes("already been taken")) {
                this.showToast("Kata sudah ada", "error");
            } else {
                this.showToast("Gagal menyimpan: " + error.message, "error");
            }
        } finally {
            this.resetSubmitButton(submitBtn);
        }
    }

    resetSubmitButton(btn) {
        this.isSubmitting = false;
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Simpan";
        }
    }

    async deleteItem(id) {
        if (!confirm("Apakah Anda yakin ingin menghapus kata ini?")) return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            this.showToast("Kata berhasil dihapus", "success");
            this.loadData();
        } catch (error) {
            this.showToast("Gagal menghapus: " + error.message, "error");
        }
    }

    openModal(title) {
        document.getElementById("modalTitle").textContent = title;

        if (title === "Tambah Kata") {
            document.getElementById("wordForm").reset();
            document.getElementById("wordId").value = "";
            document.getElementById("is_bisindo").checked = false;
            document.getElementById("imagePreview").classList.add("hidden");
            document.getElementById("urlImagePreview").classList.add("hidden");
            this.selectedImageFile = null;
        }

        document.getElementById("wordModal").classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    closeModal() {
        document.getElementById("wordModal").classList.add("hidden");
        document.body.style.overflow = "";
        this.selectedImageFile = null;
        this.isSubmitting = false;
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
let wordsManager;
document.addEventListener("DOMContentLoaded", () => {
    wordsManager = new WordsManager();
});
