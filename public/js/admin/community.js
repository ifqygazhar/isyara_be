class CommunityManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/information/community",
            tableBodyId: "communityTableBody",
            cardContainerId: "communityCardContainer",
            modalId: "communityModal",
            formId: "communityForm",
        });

        this.isSubmitting = false; // Flag untuk mencegah double submit
        this.setupEventListeners();
        this.loadData();
    }

    setupEventListeners() {
        // Add button
        const addBtn = document.getElementById("addCommunityBtn");
        if (addBtn) {
            addBtn.addEventListener("click", () => {
                this.openModal("Tambah Komunitas");
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
        const form = document.getElementById("communityForm");
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
        const modal = document.getElementById("communityModal");
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
            console.error("Error loading community:", error);
            this.renderEmptyState("Gagal memuat data komunitas");
        }
    }

    renderData(communities) {
        const tableBody = document.getElementById("communityTableBody");

        if (!communities || communities.length === 0) {
            this.renderEmptyState("Tidak ada komunitas ditemukan");
            return;
        }

        // Desktop table rows
        tableBody.innerHTML = communities
            .map(
                (item) => `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${
                    item.id
                }</td>
                <td class="px-4 py-3">
                    <div class="text-sm font-medium text-gray-900">${this.truncate(
                        item.title,
                        40
                    )}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                    ${
                        item.image_url
                            ? `<img src="${item.image_url}" alt="${item.title}" class="w-12 h-12 object-cover rounded-lg">`
                            : `<div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <i class="fas fa-users text-gray-400"></i>
                            </div>`
                    }
                </td>
                <td class="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                    ${this.truncate(
                        item.description || "Tidak ada deskripsi",
                        60
                    )}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    ${new Date(item.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center gap-2">
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors cursor-pointer" 
                            onclick="communityManager.editItem(${item.id})"
                            title="Edit Komunitas">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer" 
                            onclick="communityManager.deleteItem(${item.id})"
                            title="Hapus Komunitas">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
            )
            .join("");
    }

    renderEmptyState(message = "Tidak ada komunitas ditemukan") {
        const tableBody = document.getElementById("communityTableBody");

        const emptyStateHtml = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center">
                    <div class="text-gray-500">
                        <i class="fas fa-users text-4xl mb-4 text-gray-300"></i>
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
                item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
        );
        this.renderData(filteredData);
    }

    editItem(id) {
        const item = this.data.find((c) => c.id === id);
        if (!item) return;

        document.getElementById("communityId").value = item.id;
        document.getElementById("title").value = item.title;
        document.getElementById("imageUrl").value = item.image_url || "";
        document.getElementById("description").value = item.description || "";

        this.openModal("Edit Komunitas");
    }

    async handleSubmit(e) {
        // Prevent double submission
        if (this.isSubmitting) {
            console.log("Sudah dalam proses submit, melewati...");
            return;
        }

        this.isSubmitting = true;

        const communityId = document.getElementById("communityId").value;
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
        if (!title) {
            this.showToast("Judul wajib diisi", "error");
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

        if (!description) {
            this.showToast("Deskripsi wajib diisi", "error");
            this.isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan";
            }
            return;
        }

        const data = {
            title: title,
            image_url: imageUrl,
            description: description,
        };

        try {
            if (communityId) {
                await this.api.put(`${this.endpoint}/${communityId}`, data);
                this.showToast("Komunitas berhasil diperbarui", "success");
            } else {
                await this.api.post(this.endpoint, data);
                this.showToast("Komunitas berhasil ditambahkan", "success");
            }
            this.closeModal();
            await this.loadData();
        } catch (error) {
            console.error("Submit error:", error);
            this.showToast(
                "Gagal menyimpan komunitas: " + error.message,
                "error"
            );
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
        if (!confirm("Apakah Anda yakin ingin menghapus komunitas ini?"))
            return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            this.showToast("Komunitas berhasil dihapus", "success");
            this.loadData();
        } catch (error) {
            this.showToast(
                "Gagal menghapus komunitas: " + error.message,
                "error"
            );
        }
    }

    truncate(text, length) {
        if (!text) return "";
        return text.length > length ? text.substring(0, length) + "..." : text;
    }

    openModal(title) {
        const modal = document.getElementById("communityModal");
        document.getElementById("modalTitle").textContent = title;

        if (title === "Tambah Komunitas") {
            document.getElementById("communityForm").reset();
            document.getElementById("communityId").value = "";
        }

        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    closeModal() {
        const modal = document.getElementById("communityModal");
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
let communityManager;
document.addEventListener("DOMContentLoaded", () => {
    communityManager = new CommunityManager();
});
