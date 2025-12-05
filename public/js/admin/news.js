class NewsManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/information/news",
            tableBodyId: "newsTableBody",
            cardContainerId: "newsCardContainer",
            modalId: "newsModal",
            formId: "newsForm",
        });

        document.getElementById("addNewsBtn")?.addEventListener("click", () => {
            this.openModal("Add News");
        });

        document.getElementById("cancelBtn")?.addEventListener("click", () => {
            this.closeModal();
        });

        this.setupEventListeners();
        this.loadData();
    }

    setupEventListeners() {
        let searchTimeout;
        document
            .getElementById("searchInput")
            ?.addEventListener("input", (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filterData(e.target.value);
                }, 300);
            });

        document.querySelectorAll(".close, #cancelBtn").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.closeModal();
            });
        });

        document.getElementById("newsForm")?.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleSubmit(e);
        });
    }

    async loadData() {
        try {
            const response = await this.api.get(this.endpoint);
            this.data = response.data || response;
            this.renderData(this.data);
        } catch (error) {
            console.error("Error loading news:", error);
            this.renderEmptyState("Error loading news");
        }
    }

    renderData(news) {
        const tableBody = document.getElementById("newsTableBody");
        const cardContainer = document.getElementById("newsCardContainer");

        if (!news || news.length === 0) {
            this.renderEmptyState("No news found");
            return;
        }

        // Desktop table rows
        tableBody.innerHTML = news
            .map(
                (item) => `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
                    item.id
                }</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 mr-3">
                            ${
                                item.image_url
                                    ? `<img src="${item.image_url}" alt="${item.title}" class="w-10 h-10 object-cover rounded-lg">`
                                    : `<div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <i class="fas fa-newspaper text-gray-400"></i>
                                </div>`
                            }
                        </div>
                        <div class="text-sm font-medium text-gray-900">${this.truncate(
                            item.title,
                            40
                        )}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${this.truncate(item.description || "No description", 60)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(item.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center gap-2">
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors" 
                            onclick="newsManager.editItem(${item.id})"
                            title="Edit News">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors" 
                            onclick="newsManager.deleteItem(${item.id})"
                            title="Delete News">
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
            cardContainer.innerHTML = news
                .map(
                    (item) => `
                <div class="border-b border-gray-200 p-4 hover:bg-gray-50 transition">
                    <div class="flex items-start space-x-4">
                        <div class="flex-shrink-0">
                            ${
                                item.image_url
                                    ? `<img src="${item.image_url}" alt="${item.title}" class="w-16 h-16 object-cover rounded-lg">`
                                    : `<div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <i class="fas fa-newspaper text-2xl text-gray-400"></i>
                                </div>`
                            }
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <p class="text-lg font-semibold text-gray-900 truncate">${
                                    item.title
                                }</p>
                                <span class="text-xs text-gray-500">ID: ${
                                    item.id
                                }</span>
                            </div>
                            <p class="text-sm text-gray-500 mt-1 line-clamp-2">${
                                item.description || "No description"
                            }</p>
                            <p class="text-xs text-gray-400 mt-2">
                                Created: ${new Date(
                                    item.created_at
                                ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                            <div class="flex items-center gap-2 mt-3">
                                <button 
                                    onclick="newsManager.editItem(${item.id})" 
                                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition">
                                    <i class="fas fa-edit mr-1"></i>
                                    Edit
                                </button>
                                <button 
                                    onclick="newsManager.deleteItem(${
                                        item.id
                                    })" 
                                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-red-600 hover:bg-red-700 transition">
                                    <i class="fas fa-trash mr-1"></i>
                                    Delete
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

    renderEmptyState(message = "No news found") {
        const tableBody = document.getElementById("newsTableBody");
        const cardContainer = document.getElementById("newsCardContainer");

        const emptyStateHtml = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-newspaper text-4xl mb-4 text-gray-300"></i>
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
        const item = this.data.find((n) => n.id === id);
        if (!item) return;

        document.getElementById("newsId").value = item.id;
        document.getElementById("title").value = item.title;
        document.getElementById("imageUrl").value = item.image_url || "";
        document.getElementById("description").value = item.description || "";

        this.openModal("Edit News");
    }

    async handleSubmit(e) {
        const newsId = document.getElementById("newsId").value;
        const data = {
            title: document.getElementById("title").value,
            image_url: document.getElementById("imageUrl").value || null,
            description: document.getElementById("description").value,
        };

        try {
            if (newsId) {
                await this.api.put(`${this.endpoint}/${newsId}`, data);
                this.showToast("News updated successfully", "success");
            } else {
                await this.api.post(this.endpoint, data);
                this.showToast("News created successfully", "success");
            }
            this.closeModal();
            this.loadData();
        } catch (error) {
            this.showToast("Failed to save news: " + error.message, "error");
        }
    }

    async deleteItem(id) {
        if (!confirm("Are you sure you want to delete this news?")) return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            this.showToast("News deleted successfully", "success");
            this.loadData();
        } catch (error) {
            this.showToast("Failed to delete news: " + error.message, "error");
        }
    }

    truncate(text, length) {
        if (!text) return "";
        return text.length > length ? text.substring(0, length) + "..." : text;
    }

    openModal(title) {
        const modal = document.getElementById("newsModal");
        document.getElementById("modalTitle").textContent = title;

        if (title === "Add News") {
            document.getElementById("newsForm").reset();
            document.getElementById("newsId").value = "";
        }

        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    closeModal() {
        const modal = document.getElementById("newsModal");
        modal.classList.add("hidden");
        document.body.style.overflow = "";
    }

    showToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
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
let newsManager;
document.addEventListener("DOMContentLoaded", () => {
    newsManager = new NewsManager();
});
