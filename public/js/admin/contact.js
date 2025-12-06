class ContactManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/contact",
            tableBodyId: "contactTableBody",
            cardContainerId: "contactCardContainer",
            modalId: "contactModal",
            formId: "contactForm",
        });

        this.currentContact = null;
        this.setupEventListeners();
        this.loadData();
    }

    setupEventListeners() {
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

        // Close modal buttons
        document.querySelectorAll(".close, #closeBtn").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.closeModal();
            });
        });

        // Delete from detail button
        document
            .getElementById("deleteDetailBtn")
            ?.addEventListener("click", () => {
                if (this.currentContact) {
                    this.deleteFromDetail(this.currentContact.id);
                }
            });

        // Modal backdrop click
        document
            .getElementById("contactModal")
            ?.addEventListener("click", (e) => {
                if (e.target === e.currentTarget) {
                    this.closeModal();
                }
            });
    }

    async loadData() {
        try {
            const response = await this.api.get(this.endpoint);
            this.data = response.data || response;
            this.renderData(this.data);
        } catch (error) {
            console.error("Error loading contact messages:", error);
            this.renderEmptyState("Gagal memuat pesan kontak");
        }
    }

    renderData(contacts) {
        const tableBody = document.getElementById("contactTableBody");
        const cardContainer = document.getElementById("contactCardContainer");

        if (!contacts || contacts.length === 0) {
            this.renderEmptyState("Tidak ada pesan kontak ditemukan");
            return;
        }

        // Desktop table rows
        tableBody.innerHTML = contacts
            .map(
                (item) => `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                    item.id
                }</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 mr-3">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(
                                item.name || "User"
                            )}" 
                                 alt="${item.name}" 
                                 class="w-10 h-10 rounded-full object-cover">
                        </div>
                        <div class="text-sm font-medium text-gray-900">${
                            item.name
                        }</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">${
                    item.email
                }</td>
                <td class="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                    ${this.truncate(item.message, 60)}
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
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors cursor-pointer" 
                            onclick="contactManager.viewDetail(${item.id})"
                            title="Lihat Pesan">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer" 
                            onclick="contactManager.deleteItem(${item.id})"
                            title="Hapus Pesan">
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
            cardContainer.innerHTML = contacts
                .map(
                    (item) => `
                <div class="border-b border-gray-200 p-4 hover:bg-gray-50 transition">
                    <div class="flex items-start space-x-4">
                        <div class="flex-shrink-0">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(
                                item.name || "User"
                            )}" 
                                 alt="${item.name}" 
                                 class="w-12 h-12 rounded-full object-cover">
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <p class="text-lg font-semibold text-gray-900">${
                                    item.name
                                }</p>
                                <span class="text-xs text-gray-500">ID: ${
                                    item.id
                                }</span>
                            </div>
                            <p class="text-sm text-gray-500 truncate">${
                                item.email
                            }</p>
                            <p class="text-sm text-gray-700 mt-1 line-clamp-2">${
                                item.message
                            }</p>
                            <p class="text-xs text-gray-400 mt-2">
                                Dikirim: ${new Date(
                                    item.created_at
                                ).toLocaleDateString("id-ID", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                            <div class="flex items-center gap-2 mt-3">
                                <button 
                                    onclick="contactManager.viewDetail(${
                                        item.id
                                    })" 
                                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer">
                                    <i class="fas fa-eye mr-1"></i>
                                    Lihat
                                </button>
                                <button 
                                    onclick="contactManager.deleteItem(${
                                        item.id
                                    })" 
                                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-red-600 hover:bg-red-700 transition cursor-pointer">
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

    renderEmptyState(message = "Tidak ada pesan kontak ditemukan") {
        const tableBody = document.getElementById("contactTableBody");
        const cardContainer = document.getElementById("contactCardContainer");

        const emptyStateHtml = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-envelope text-4xl mb-4 text-gray-300"></i>
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
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.message?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderData(filteredData);
    }

    async viewDetail(id) {
        try {
            const response = await this.api.get(`${this.endpoint}/${id}`);
            const contact = response.data || response;
            this.currentContact = contact;

            document.getElementById("detailName").textContent = contact.name;
            document.getElementById("detailEmail").textContent = contact.email;
            document.getElementById("detailMessage").textContent =
                contact.message;
            document.getElementById("detailDate").textContent = new Date(
                contact.created_at
            ).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });

            document.getElementById("contactModal").classList.remove("hidden");
            document.body.style.overflow = "hidden";
        } catch (error) {
            this.showToast(
                "Gagal memuat detail pesan: " + error.message,
                "error"
            );
        }
    }

    async deleteItem(id) {
        if (!confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            this.showToast("Pesan berhasil dihapus", "success");
            this.loadData();
        } catch (error) {
            this.showToast("Gagal menghapus pesan: " + error.message, "error");
        }
    }

    async deleteFromDetail(id) {
        if (!confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            this.showToast("Pesan berhasil dihapus", "success");
            this.closeModal();
            this.loadData();
        } catch (error) {
            this.showToast("Gagal menghapus pesan: " + error.message, "error");
        }
    }

    truncate(text, length) {
        if (!text) return "";
        return text.length > length ? text.substring(0, length) + "..." : text;
    }

    closeModal() {
        const modal = document.getElementById("contactModal");
        if (modal) {
            modal.classList.add("hidden");
            document.body.style.overflow = "";
        }
        this.currentContact = null;
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
let contactManager;
document.addEventListener("DOMContentLoaded", () => {
    contactManager = new ContactManager();
});
