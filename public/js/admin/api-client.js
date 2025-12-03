// API Client for Admin Panel
class ApiClient {
    constructor() {
        this.baseUrl = "/api";
        this.token = localStorage.getItem("auth_token");
    }

    async request(endpoint, options = {}) {
        const config = {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${this.token}`,
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Request failed");
            }

            return data;
        } catch (error) {
            console.error("API Error:", error);
            if (error.message.includes("Unauthenticated")) {
                window.location.href = "/admin/login";
            }
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: "GET" });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: "DELETE" });
    }
}

// Utility Functions
const utils = {
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    },

    truncate(text, length = 50) {
        if (!text) return "-";
        return text.length > length ? text.substring(0, length) + "..." : text;
    },

    showToast(message, type = "success") {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("show");
        }, 100);

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    confirm(message) {
        return window.confirm(message);
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    renderImage(url, alt = "Image") {
        if (!url) return '<span class="no-image">No image</span>';
        return `<img src="${url}" alt="${alt}" class="table-image" onclick="window.open('${url}', '_blank')">`;
    },

    renderVideo(url) {
        if (!url) return '<span class="text-muted">-</span>';
        return `<a href="${url}" target="_blank" class="video-link">View Video</a>`;
    },
};

// Base CRUD Manager
class CrudManager {
    constructor(config) {
        this.api = new ApiClient();
        this.endpoint = config.endpoint;
        this.tableBodyId = config.tableBodyId;
        this.modalId = config.modalId;
        this.formId = config.formId;
        this.searchInputId = config.searchInputId || "searchInput";

        this.data = [];
        this.filteredData = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById(this.searchInputId);
        if (searchInput) {
            searchInput.addEventListener(
                "input",
                utils.debounce((e) => {
                    this.filterData(e.target.value);
                }, 300)
            );
        }

        // Modal close
        const modal = document.getElementById(this.modalId);
        const closeBtn = modal?.querySelector(".close");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => this.closeModal());
        }

        // Click outside modal
        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Form submit
        const form = document.getElementById(this.formId);
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleSubmit(e);
            });
        }
    }

    async loadData() {
        try {
            const response = await this.api.get(this.endpoint);
            this.data = response.data || response;
            this.filteredData = this.data;
            this.renderTable();
        } catch (error) {
            utils.showToast("Failed to load data: " + error.message, "error");
            this.renderError(error.message);
        }
    }

    filterData(query) {
        const lowerQuery = query.toLowerCase();
        this.filteredData = this.data.filter((item) =>
            this.searchFields(item).some((field) =>
                String(field).toLowerCase().includes(lowerQuery)
            )
        );
        this.renderTable();
    }

    searchFields(item) {
        // Override this in child classes
        return Object.values(item);
    }

    renderTable() {
        const tbody = document.getElementById(this.tableBodyId);
        if (!tbody) return;

        if (this.filteredData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="100" class="text-center">No data found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredData
            .map((item) => this.renderRow(item))
            .join("");
    }

    renderRow(item) {
        // Override this in child classes
        return "";
    }

    renderError(message) {
        const tbody = document.getElementById(this.tableBodyId);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="100" class="text-center text-danger">
                        Error: ${message}
                    </td>
                </tr>
            `;
        }
    }

    openModal(title = "Add Item") {
        const modal = document.getElementById(this.modalId);
        const modalTitle = modal?.querySelector("#modalTitle");
        if (modalTitle) modalTitle.textContent = title;
        if (modal) modal.classList.add("show");
    }

    closeModal() {
        const modal = document.getElementById(this.modalId);
        if (modal) modal.classList.remove("show");
        this.resetForm();
    }

    resetForm() {
        const form = document.getElementById(this.formId);
        if (form) form.reset();
    }

    async handleSubmit(e) {
        // Override this in child classes
    }

    async deleteItem(
        id,
        confirmMessage = "Are you sure you want to delete this item?"
    ) {
        if (!utils.confirm(confirmMessage)) return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            utils.showToast("Item deleted successfully");
            this.loadData();
        } catch (error) {
            utils.showToast("Failed to delete: " + error.message, "error");
        }
    }

    editItem(item) {
        // Override this in child classes
        this.openModal("Edit Item");
    }
}
