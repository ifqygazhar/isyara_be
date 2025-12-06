class LettersManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/dictionary/letters",
            tableBodyId: "lettersTableBody",
            cardContainerId: "lettersCardContainer",
            modalId: "letterModal",
            formId: "letterForm",
        });

        this.isSubmitting = false; // Flag untuk mencegah double submit
        this.setupEventListeners();
        this.loadData();
    }

    setupEventListeners() {
        // Add button
        const addBtn = document.getElementById("addLetterBtn");
        if (addBtn) {
            addBtn.addEventListener("click", () => {
                this.openModal("Tambah Huruf");
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
        const form = document.getElementById("letterForm");
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
        const modal = document.getElementById("letterModal");
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
                    <div class="flex items-center">
                        <span class="text-2xl font-bold text-indigo-600 mr-3">${
                            letter.huruf
                        }</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    ${
                        letter.image_url
                            ? `<img src="${letter.image_url}" alt="${letter.huruf}" class="w-12 h-12 object-cover rounded-lg">`
                            : `<div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
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
        `
            )
            .join("");
    }

    renderEmptyState(message = "Tidak ada huruf ditemukan") {
        const tableBody = document.getElementById("lettersTableBody");

        const emptyStateHtml = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center">
                    <div class="text-gray-500">
                        <i class="fas fa-font text-4xl mb-4 text-gray-300"></i>
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
        const filteredData = this.data.filter((letter) =>
            letter.huruf?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderData(filteredData);
    }

    editItem(id) {
        const item = this.data.find((l) => l.id === id);
        if (!item) return;

        document.getElementById("letterId").value = item.id;
        document.getElementById("huruf").value = item.huruf;
        document.getElementById("imageUrl").value = item.image_url || "";

        this.openModal("Edit Huruf");
    }

    async handleSubmit(e) {
        // Prevent double submission
        if (this.isSubmitting) {
            console.log("Already submitting, skipping...");
            return;
        }

        this.isSubmitting = true;

        const letterId = document.getElementById("letterId").value;
        const huruf = document
            .getElementById("huruf")
            .value.trim()
            .toUpperCase();
        const imageUrl = document.getElementById("imageUrl").value.trim();

        // Disable submit button
        const submitBtn = document.getElementById("saveBtn");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';
        }

        // Validasi client-side
        if (!huruf) {
            this.showToast("Huruf wajib diisi", "error");
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
            huruf: huruf,
            image_url: imageUrl,
        };

        try {
            if (letterId) {
                // Update
                await this.api.put(`${this.endpoint}/${letterId}`, data);
                this.showToast("Huruf berhasil diperbarui", "success");
            } else {
                // Create
                await this.api.post(this.endpoint, data);
                this.showToast("Huruf berhasil ditambahkan", "success");
            }

            this.closeModal();
            await this.loadData();
        } catch (error) {
            console.error("Submit error:", error);

            // Handle validation errors
            if (error.message.includes("already been taken")) {
                this.showToast(`Huruf "${huruf}" sudah ada`, "error");
            } else {
                this.showToast(
                    "Gagal menyimpan huruf: " + error.message,
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
        if (!confirm("Apakah Anda yakin ingin menghapus huruf ini?")) return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            this.showToast("Huruf berhasil dihapus", "success");
            this.loadData();
        } catch (error) {
            this.showToast("Gagal menghapus huruf: " + error.message, "error");
        }
    }

    openModal(title) {
        const modal = document.getElementById("letterModal");
        document.getElementById("modalTitle").textContent = title;

        if (title === "Tambah Huruf") {
            document.getElementById("letterForm").reset();
            document.getElementById("letterId").value = "";
        }

        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    closeModal() {
        const modal = document.getElementById("letterModal");
        modal.classList.add("hidden");
        document.body.style.overflow = "";
        document.getElementById("letterForm").reset();
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
let lettersManager;
document.addEventListener("DOMContentLoaded", () => {
    lettersManager = new LettersManager();
});
