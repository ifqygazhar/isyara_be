class WordsManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/dictionary/words",
            tableBodyId: "wordsTableBody",
            cardContainerId: "wordsCardContainer",
            modalId: "wordModal",
            formId: "wordForm",
        });

        this.isSubmitting = false; // Flag untuk mencegah double submit
        this.setupEventListeners();
        this.loadData();
    }

    setupEventListeners() {
        // Add button
        const addBtn = document.getElementById("addWordBtn");
        if (addBtn) {
            addBtn.addEventListener("click", () => {
                this.openModal("Tambah Kata");
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById("cancelBtn");
        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
                this.closeModal();
            });
        }

        // Close buttons
        document.querySelectorAll(".close").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.closeModal();
            });
        });

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

        // Form submission - PASTIKAN HANYA 1 EVENT LISTENER
        const form = document.getElementById("wordForm");
        if (form) {
            // Remove existing listeners (jika ada)
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

            // Add single event listener
            newForm.addEventListener("submit", (e) => {
                e.preventDefault();
                e.stopPropagation(); // Stop event bubbling
                this.handleSubmit(e);
            });
        }

        // Modal backdrop click
        const modal = document.getElementById("wordModal");
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    async loadData() {
        try {
            const response = await this.api.get(this.endpoint);
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
                    <div class="flex items-center">
                        <span class="text-lg font-semibold text-gray-900">${
                            word.kata
                        }</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${
                        word.image_url
                            ? `<img src="${word.image_url}" alt="${word.kata}" class="w-12 h-12 object-cover rounded-lg">`
                            : `<div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <i class="fas fa-image text-gray-400"></i>
                        </div>`
                    }
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${
                        word.video_url
                            ? `<div class="flex items-center gap-2">
                            <i class="fas fa-video text-green-600"></i>
                            <span class="text-sm text-gray-600">Tersedia</span>
                        </div>`
                            : `<div class="flex items-center gap-2">
                            <i class="fas fa-video text-gray-400"></i>
                            <span class="text-sm text-gray-400">Tidak ada</span>
                        </div>`
                    }
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
        `
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
                            <div class="mt-1 flex items-center gap-4">
                                <div class="flex items-center gap-1 text-sm ${
                                    word.video_url
                                        ? "text-green-600"
                                        : "text-gray-400"
                                }">
                                    <i class="fas fa-video"></i>
                                    <span>${
                                        word.video_url
                                            ? "Video"
                                            : "Tidak ada video"
                                    }</span>
                                </div>
                            </div>
                            <p class="text-xs text-gray-400 mt-2">
                                Dibuat: ${new Date(
                                    word.created_at
                                ).toLocaleDateString("id-ID", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                            <div class="flex items-center gap-2 mt-3">
                                <button 
                                    onclick="wordsManager.editItem(${word.id})" 
                                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition">
                                    <i class="fas fa-edit mr-1"></i>
                                    Edit
                                </button>
                                <button 
                                    onclick="wordsManager.deleteItem(${
                                        word.id
                                    })" 
                                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-red-600 hover:bg-red-700 transition">
                                    <i class="fas fa-trash mr-1"></i>
                                    Hapus
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
        const filteredData = this.data.filter((word) =>
            word.kata?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderData(filteredData);
    }

    editItem(id) {
        const item = this.data.find((w) => w.id === id);
        if (!item) return;

        document.getElementById("wordId").value = item.id;
        document.getElementById("kata").value = item.kata;
        document.getElementById("imageUrl").value = item.image_url || "";

        this.openModal("Edit Kata");
    }

    async handleSubmit(e) {
        // Prevent double submission
        if (this.isSubmitting) {
            console.log("Already submitting, skipping...");
            return;
        }

        this.isSubmitting = true;

        const wordId = document.getElementById("wordId").value;
        const kata = document.getElementById("kata").value.trim();
        const imageUrl = document.getElementById("imageUrl").value.trim();

        // Disable submit button
        const submitBtn = document.getElementById("saveBtn");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';
        }

        // Validasi client-side
        if (!kata) {
            this.showToast("Kata wajib diisi", "error");
            this.isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan";
            }
            return;
        }

        if (!imageUrl) {
            this.showToast("URL Gambar wajib diisi", "error");
            this.isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan";
            }
            return;
        }

        const data = {
            kata: kata,
            image_url: imageUrl,
        };

        try {
            if (wordId) {
                await this.api.put(`${this.endpoint}/${wordId}`, data);
                this.showToast("Kata berhasil diperbarui", "success");
            } else {
                await this.api.post(this.endpoint, data);
                this.showToast("Kata berhasil ditambahkan", "success");
            }
            this.closeModal();
            await this.loadData();
        } catch (error) {
            console.error("Submit error:", error);

            // Handle validation errors
            if (error.message.includes("already been taken")) {
                this.showToast(`Kata "${kata}" sudah ada`, "error");
            } else {
                this.showToast(
                    "Gagal menyimpan kata: " + error.message,
                    "error"
                );
            }
        } finally {
            // Re-enable submit button
            this.isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan";
            }
        }
    }

    async deleteItem(id) {
        if (!confirm("Apakah Anda yakin ingin menghapus kata ini?")) return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            this.showToast("Kata berhasil dihapus", "success");
            this.loadData();
        } catch (error) {
            this.showToast("Gagal menghapus kata: " + error.message, "error");
        }
    }

    openModal(title) {
        const modal = document.getElementById("wordModal");
        document.getElementById("modalTitle").textContent = title;

        if (title === "Tambah Kata") {
            document.getElementById("wordForm").reset();
            document.getElementById("wordId").value = "";
        }

        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    closeModal() {
        const modal = document.getElementById("wordModal");
        modal.classList.add("hidden");
        document.body.style.overflow = "";
        this.isSubmitting = false; // Reset flag
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
let wordsManager;
document.addEventListener("DOMContentLoaded", () => {
    wordsManager = new WordsManager();
});
