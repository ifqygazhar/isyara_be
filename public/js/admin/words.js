class WordsManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/dictionary/words",
            tableBodyId: "wordsTableBody",
            cardContainerId: "wordsCardContainer",
            modalId: "wordModal",
            formId: "wordForm",
        });

        document.getElementById("addWordBtn")?.addEventListener("click", () => {
            this.openModal("Add Word");
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

        document.getElementById("wordForm")?.addEventListener("submit", (e) => {
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
            console.error("Error loading words:", error);
            this.renderEmptyState("Error loading words");
        }
    }

    renderData(words) {
        const tableBody = document.getElementById("wordsTableBody");
        const cardContainer = document.getElementById("wordsCardContainer");

        if (!words || words.length === 0) {
            this.renderEmptyState("No words found");
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
                            <span class="text-sm text-gray-600">Available</span>
                        </div>`
                            : `<div class="flex items-center gap-2">
                            <i class="fas fa-video text-gray-400"></i>
                            <span class="text-sm text-gray-400">None</span>
                        </div>`
                    }
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(word.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center gap-2">
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors" 
                            onclick="wordsManager.editItem(${word.id})"
                            title="Edit Word">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors" 
                            onclick="wordsManager.deleteItem(${word.id})"
                            title="Delete Word">
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
                                        word.video_url ? "Video" : "No Video"
                                    }</span>
                                </div>
                            </div>
                            <p class="text-xs text-gray-400 mt-2">
                                Created: ${new Date(
                                    word.created_at
                                ).toLocaleDateString("en-US", {
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

    renderEmptyState(message = "No words found") {
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
        document.getElementById("videoUrl").value = item.video_url || "";

        this.openModal("Edit Word");
    }

    async handleSubmit(e) {
        const wordId = document.getElementById("wordId").value;
        const data = {
            kata: document.getElementById("kata").value,
            image_url: document.getElementById("imageUrl").value || null,
            video_url: document.getElementById("videoUrl").value || null,
        };

        try {
            if (wordId) {
                await this.api.put(`${this.endpoint}/${wordId}`, data);
                this.showToast("Word updated successfully", "success");
            } else {
                await this.api.post(this.endpoint, data);
                this.showToast("Word created successfully", "success");
            }
            this.closeModal();
            this.loadData();
        } catch (error) {
            this.showToast("Failed to save word: " + error.message, "error");
        }
    }

    async deleteItem(id) {
        if (!confirm("Are you sure you want to delete this word?")) return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            this.showToast("Word deleted successfully", "success");
            this.loadData();
        } catch (error) {
            this.showToast("Failed to delete word: " + error.message, "error");
        }
    }

    openModal(title) {
        const modal = document.getElementById("wordModal");
        document.getElementById("modalTitle").textContent = title;

        if (title === "Add Word") {
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
let wordsManager;
document.addEventListener("DOMContentLoaded", () => {
    wordsManager = new WordsManager();
});
