class LettersManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/dictionary/letters",
            tableBodyId: "lettersTableBody",
            modalId: "letterModal",
            formId: "letterForm",
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
        document
            .getElementById("addLetterBtn")
            ?.addEventListener("click", () => {
                this.openModal("Tambah Huruf");
            });

        // Modal events
        document
            .getElementById("letterModal")
            ?.addEventListener("click", (e) => {
                if (e.target === e.currentTarget) {
                    this.closeModal();
                }
                if (
                    e.target.id === "cancelBtn" ||
                    e.target.closest("#cancelBtn")
                ) {
                    this.closeModal();
                }
            });

        document.querySelectorAll(".close").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.closeModal();
            });
        });

        // Form submission
        const form = document.getElementById("letterForm");
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
            console.error("Error loading letters:", error);
            this.renderEmptyState("Gagal memuat data huruf");
        }
    }

    renderData(letters) {
        const tableBody = document.getElementById("lettersTableBody");

        if (!letters || letters.length === 0) {
            this.renderEmptyState("Tidak ada huruf ditemukan");
            return;
        }

        tableBody.innerHTML = letters
            .map(
                (letter) => `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                    letter.id
                }</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-2xl font-bold text-indigo-600">${
                        letter.huruf
                    }</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    ${
                        letter.image_url
                            ? `<img src="${letter.image_url}" alt="${letter.huruf}" class="w-16 h-16 object-cover rounded-lg border-2 border-gray-200">`
                            : `<div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <i class="fas fa-image text-gray-400"></i>
                            </div>`
                    }
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    ${new Date(letter.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center gap-2">
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors cursor-pointer" 
                            onclick="lettersManager.editItem(${letter.id})"
                            title="Edit Huruf">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer" 
                            onclick="lettersManager.deleteItem(${letter.id})"
                            title="Hapus Huruf">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `,
            )
            .join("");
    }

    renderEmptyState(message = "Tidak ada huruf ditemukan") {
        const tableBody = document.getElementById("lettersTableBody");
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center">
                    <div class="text-gray-500">
                        <i class="fas fa-font text-4xl mb-4 text-gray-300"></i>
                        <p>${message}</p>
                    </div>
                </td>
            </tr>
        `;
    }

    filterData(searchTerm) {
        const filteredData = this.data.filter((letter) =>
            letter.huruf?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        this.renderData(filteredData);
    }

    editItem(id) {
        const item = this.data.find((l) => l.id === id);
        if (!item) return;

        document.getElementById("letterId").value = item.id;
        document.getElementById("huruf").value = item.huruf;
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

        this.openModal("Edit Huruf");
    }

    async handleSubmit(e) {
        if (this.isSubmitting) return;
        this.isSubmitting = true;

        const letterId = document.getElementById("letterId").value;
        const submitBtn = document.getElementById("saveBtn");

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';
        }

        try {
            const huruf = document
                .getElementById("huruf")
                .value.trim()
                .toUpperCase();

            // Validasi
            if (!huruf) {
                this.showToast("Huruf wajib diisi", "error");
                this.resetSubmitButton(submitBtn);
                return;
            }

            // SELALU gunakan FormData untuk support file upload
            const formData = new FormData();
            formData.append("huruf", huruf);
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

            if (letterId) {
                await this.api.post(`${this.endpoint}/${letterId}`, formData);
                this.showToast("Huruf berhasil diperbarui", "success");
            } else {
                // CREATE
                await this.api.post(this.endpoint, formData);
                this.showToast("Huruf berhasil ditambahkan", "success");
            }

            this.closeModal();
            this.loadData();
        } catch (error) {
            console.error("Submit error:", error);
            if (error.message.includes("already been taken")) {
                this.showToast(`Huruf sudah ada`, "error");
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
        if (!confirm("Apakah Anda yakin ingin menghapus huruf ini?")) return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            this.showToast("Huruf berhasil dihapus", "success");
            this.loadData();
        } catch (error) {
            this.showToast("Gagal menghapus: " + error.message, "error");
        }
    }

    openModal(title) {
        document.getElementById("modalTitle").textContent = title;

        if (title === "Tambah Huruf") {
            document.getElementById("letterForm").reset();
            document.getElementById("letterId").value = "";
            document.getElementById("is_bisindo").checked = false;
            document.getElementById("imagePreview").classList.add("hidden");
            document.getElementById("urlImagePreview").classList.add("hidden");
            this.selectedImageFile = null;
        }

        document.getElementById("letterModal").classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    closeModal() {
        document.getElementById("letterModal").classList.add("hidden");
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

let lettersManager;
document.addEventListener("DOMContentLoaded", () => {
    lettersManager = new LettersManager();
});
