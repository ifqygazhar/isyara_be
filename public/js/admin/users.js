// Users Management
class UsersManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/users",
            tableBodyId: "usersTableBody",
            modalId: "userModal",
            formId: "userForm",
        });

        this.selectedImageFile = null;
        this.imageMode = "upload"; // "upload" or "url"
        this.isSubmitting = false;

        this.setupEventListeners();
        this.setupImageUpload();
        this.loadData();
    }

    setupEventListeners() {
        // Add button
        document.getElementById("addUserBtn")?.addEventListener("click", () => {
            this.openModal("Tambah Pengguna");
            document.getElementById("passwordHint").style.display = "none";
        });

        // Close button (X)
        document.querySelectorAll(".close").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.closeModal();
            });
        });

        // Modal backdrop click
        document.getElementById("userModal")?.addEventListener("click", (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
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

        // Form submission
        const form = document.getElementById("userForm");
        if (form) {
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

            newForm.addEventListener("submit", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleSubmit(e);
            });

            // Re-attach Cancel button listener SETELAH clone
            const cancelBtn = newForm.querySelector("#cancelBtn");
            if (cancelBtn) {
                cancelBtn.addEventListener("click", () => {
                    this.closeModal();
                });
            }
        }
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

        // File input change
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

        // Remove image button
        document
            .getElementById("removeImageBtn")
            ?.addEventListener("click", () => {
                this.selectedImageFile = null;
                document.getElementById("imageFile").value = "";
                document.getElementById("imagePreview").classList.add("hidden");
            });

        // URL image preview
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

    searchFields(item) {
        return [item.name, item.email, item.role];
    }

    renderRow(item) {
        return `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">${
                    item.id
                }</td>
                <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">${
                    item.name
                }</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap hidden md:table-cell">${
                    item.email
                }</td>
                <td class="px-4 py-3 text-sm whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.role === "admin"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-gray-100 text-gray-800"
                    }">
                        ${item.role === "admin" ? "Admin" : "Pengguna"}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm whitespace-nowrap hidden lg:table-cell">
                    ${
                        item.image_url
                            ? `<img src="${item.image_url}" alt="${item.name}" class="w-10 h-10 rounded-full object-cover">`
                            : `<div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <i class="fas fa-user text-gray-400"></i>
                            </div>`
                    }
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap hidden lg:table-cell">
                    ${new Date(item.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </td>
                <td class="px-4 py-3 text-sm whitespace-nowrap">
                    <div class="flex items-center gap-2">
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors cursor-pointer" 
                            onclick="usersManager.editItem(${item.id})"
                            title="Edit Pengguna">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer" 
                            onclick="usersManager.deleteItem(${item.id})"
                            title="Hapus Pengguna">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    editItem(id) {
        const item = this.data.find((u) => u.id === id);
        if (!item) return;

        document.getElementById("userId").value = item.id;
        document.getElementById("name").value = item.name;
        document.getElementById("email").value = item.email;
        document.getElementById("role").value = item.role;
        document.getElementById("password").value = "";
        document.getElementById("passwordHint").style.display = "inline";

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

        this.openModal("Edit Pengguna");
    }

    openModal(title) {
        const modal = document.getElementById("userModal");
        const modalTitle = document.getElementById("modalTitle");

        if (modalTitle) {
            modalTitle.textContent = title;
        }

        if (title === "Tambah Pengguna") {
            document.getElementById("userForm").reset();
            document.getElementById("userId").value = "";
            document
                .getElementById("password")
                .setAttribute("required", "required");
            document.getElementById("imagePreview").classList.add("hidden");
            document.getElementById("urlImagePreview").classList.add("hidden");
            this.selectedImageFile = null;
        } else {
            document.getElementById("password").removeAttribute("required");
        }

        if (modal) {
            modal.classList.remove("hidden");
            document.body.style.overflow = "hidden";
        }
    }

    closeModal() {
        const modal = document.getElementById("userModal");
        if (modal) {
            modal.classList.add("hidden");
            document.body.style.overflow = "";
        }
        this.selectedImageFile = null;
        this.isSubmitting = false;
    }

    async handleSubmit(e) {
        if (this.isSubmitting) {
            console.log("Sudah dalam proses submit, melewati...");
            return;
        }

        this.isSubmitting = true;

        const userId = document.getElementById("userId").value;
        const submitBtn = document.getElementById("saveBtn");

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';
        }

        try {
            const password = document.getElementById("password").value;

            // Validasi password untuk user baru
            if (!userId && !password) {
                this.showToast(
                    "Kata sandi wajib diisi untuk pengguna baru",
                    "error"
                );
                this.isSubmitting = false;
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Simpan";
                }
                return;
            }

            // SELALU gunakan FormData untuk support file upload
            const formData = new FormData();
            formData.append("name", document.getElementById("name").value);
            formData.append("email", document.getElementById("email").value);
            formData.append("role", document.getElementById("role").value);

            if (password) {
                formData.append("password", password);
            }

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

            if (userId) {
                await this.api.post(`${this.endpoint}/${userId}`, formData);
                this.showToast("Pengguna berhasil diperbarui", "success");
            } else {
                // CREATE
                await this.api.post(this.endpoint, formData);
                this.showToast("Pengguna berhasil ditambahkan", "success");
            }

            this.closeModal();
            this.loadData();
        } catch (error) {
            console.error("Submit error:", error);
            this.showToast(
                "Gagal menyimpan pengguna: " + error.message,
                "error"
            );
        } finally {
            this.isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan";
            }
        }
    }

    async deleteItem(id) {
        if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            this.showToast("Pengguna berhasil dihapus", "success");
            this.loadData();
        } catch (error) {
            this.showToast(
                "Gagal menghapus pengguna: " + error.message,
                "error"
            );
        }
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
let usersManager;
document.addEventListener("DOMContentLoaded", () => {
    usersManager = new UsersManager();
});
