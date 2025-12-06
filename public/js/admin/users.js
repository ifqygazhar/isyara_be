// Users Management
class UsersManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/users",
            tableBodyId: "usersTableBody",
            modalId: "userModal",
            formId: "userForm",
        });

        this.setupEventListeners();
        this.loadData();
    }

    setupEventListeners() {
        // Add button
        document.getElementById("addUserBtn")?.addEventListener("click", () => {
            this.openModal("Tambah Pengguna");
            document.getElementById("passwordHint").style.display = "none";
        });

        // Cancel button
        document.getElementById("cancelBtn")?.addEventListener("click", () => {
            this.closeModal();
        });

        // Close button (X)
        document.querySelectorAll(".close").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.closeModal();
            });
        });

        // Form submission
        document.getElementById("userForm")?.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleSubmit(e);
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
                        ${item.role}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm whitespace-nowrap hidden lg:table-cell">${utils.renderImage(
                    item.image_url,
                    item.name
                )}</td>
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap hidden lg:table-cell">${utils.formatDate(
                    item.created_at
                )}</td>
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
        document.getElementById("imageUrl").value = item.image_url || "";
        document.getElementById("password").value = "";
        document.getElementById("passwordHint").style.display = "inline";

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
    }

    async handleSubmit(e) {
        const userId = document.getElementById("userId").value;
        const data = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            role: document.getElementById("role").value,
            image_url: document.getElementById("imageUrl").value || null,
        };

        const password = document.getElementById("password").value;
        if (password) {
            data.password = password;
        }

        try {
            if (userId) {
                await this.api.put(`${this.endpoint}/${userId}`, data);
                utils.showToast("Pengguna berhasil diperbarui");
            } else {
                if (!password) {
                    utils.showToast(
                        "Pengguna baru harus memiliki kata sandi",
                        "error"
                    );
                    return;
                }
                data.password = password;
                await this.api.post(this.endpoint, data);
                utils.showToast("Pengguna berhasil dibuat");
            }
            this.closeModal();
            this.loadData();
        } catch (error) {
            utils.showToast(
                "Gagal menyimpan pengguna: " + error.message,
                "error"
            );
        }
    }

    async deleteItem(id) {
        if (!utils.confirm("Apa anda yakin ingin menghapus pengguna ini?"))
            return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            utils.showToast("Pengguna berhasil dihapus");
            this.loadData();
        } catch (error) {
            utils.showToast(
                "Gagal menghapus pengguna: " + error.message,
                "error"
            );
        }
    }
}

// Initialize
let usersManager;
document.addEventListener("DOMContentLoaded", () => {
    usersManager = new UsersManager();
});
