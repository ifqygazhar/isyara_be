class NewsManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/information/news",
            tableBodyId: "newsTableBody",
            modalId: "newsModal",
            formId: "newsForm",
        });

        this.selectedImageFile = null;
        this.imageMode = "url"; // Default to URL
        this.isSubmitting = false;

        this.setupEventListeners();
        this.setupImageUpload();
        this.loadData();
    }

    setupEventListeners() {
        document.getElementById("addNewsBtn")?.addEventListener("click", () => {
            this.openModal("Tambah Berita");
        });

        document.getElementById("newsModal")?.addEventListener("click", (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
            if (e.target.id === "cancelBtn" || e.target.closest("#cancelBtn")) {
                this.closeModal();
            }
        });

        document.querySelectorAll(".close").forEach((btn) => {
            btn.addEventListener("click", () => this.closeModal());
        });

        const form = document.getElementById("newsForm");
        if (form) {
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            newForm.addEventListener("submit", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleSubmit(e);
            });
        }

        let searchTimeout;
        document
            .getElementById("searchInput")
            ?.addEventListener("input", (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(
                    () => this.filterData(e.target.value),
                    300
                );
            });
    }

    setupImageUpload() {
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

        document
            .getElementById("removeImageBtn")
            ?.addEventListener("click", () => {
                this.selectedImageFile = null;
                document.getElementById("imageFile").value = "";
                document.getElementById("imagePreview").classList.add("hidden");
            });

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

    async loadData() {
        try {
            const response = await this.api.get(this.endpoint);
            this.data = response.data || response;
            this.renderData(this.data);
        } catch (error) {
            console.error("Error loading news:", error);
            this.renderEmptyState("Gagal memuat data berita");
        }
    }

    renderData(news) {
        const tableBody = document.getElementById("newsTableBody");
        if (!news || news.length === 0) {
            this.renderEmptyState();
            return;
        }

        tableBody.innerHTML = news
            .map(
                (item) => `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm text-gray-900">${item.id}</td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">${this.truncate(
                    item.title,
                    40
                )}</td>
                <td class="px-6 py-4 hidden md:table-cell">
                    <img src="${item.image_url}" alt="${
                    item.title
                }" class="w-16 h-16 object-cover rounded-lg">
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell max-w-xs truncate">${this.truncate(
                    item.description,
                    60
                )}</td>
                <td class="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                    ${new Date(item.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </td>
                <td class="px-6 py-4 text-sm">
                    <div class="flex gap-2">
                        <button onclick="newsManager.editItem(${
                            item.id
                        })" class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition cursor-pointer">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="newsManager.deleteItem(${
                            item.id
                        })" class="w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition cursor-pointer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
            )
            .join("");
    }

    renderEmptyState(message = "Tidak ada berita ditemukan") {
        document.getElementById("newsTableBody").innerHTML = `
            <tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">
                <i class="fas fa-newspaper text-4xl mb-4 text-gray-300"></i><p>${message}</p>
            </td></tr>
        `;
    }

    filterData(searchTerm) {
        const filtered = this.data.filter(
            (item) =>
                item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
        );
        this.renderData(filtered);
    }

    editItem(id) {
        const item = this.data.find((n) => n.id === id);
        if (!item) return;

        document.getElementById("newsId").value = item.id;
        document.getElementById("title").value = item.title;
        document.getElementById("description").value = item.description;

        this.selectedImageFile = null;
        document.getElementById("imageFile").value = "";
        document.getElementById("imagePreview").classList.add("hidden");

        if (item.image_url) {
            document.getElementById("imageUrl").value = item.image_url;
            document.getElementById("urlPreviewImg").src = item.image_url;
            document
                .getElementById("urlImagePreview")
                .classList.remove("hidden");
        }

        this.openModal("Edit Berita");
    }

    async handleSubmit(e) {
        if (this.isSubmitting) return;
        this.isSubmitting = true;

        const submitBtn = document.getElementById("saveBtn");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';
        }

        try {
            const newsId = document.getElementById("newsId").value;
            const formData = new FormData();
            formData.append("title", document.getElementById("title").value);
            formData.append(
                "description",
                document.getElementById("description").value
            );

            if (this.imageMode === "upload" && this.selectedImageFile) {
                formData.append("image", this.selectedImageFile);
            } else if (this.imageMode === "url") {
                const imageUrl = document
                    .getElementById("imageUrl")
                    .value.trim();
                if (imageUrl) formData.append("image_url", imageUrl);
            }

            if (newsId) {
                await this.api.post(`${this.endpoint}/${newsId}`, formData);
                this.showToast("Berita berhasil diperbarui", "success");
            } else {
                await this.api.post(this.endpoint, formData);
                this.showToast("Berita berhasil ditambahkan", "success");
            }

            this.closeModal();
            this.loadData();
        } catch (error) {
            this.showToast("Gagal menyimpan: " + error.message, "error");
        } finally {
            this.isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan";
            }
        }
    }

    async deleteItem(id) {
        if (!confirm("Apakah Anda yakin ingin menghapus berita ini?")) return;
        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            this.showToast("Berita berhasil dihapus", "success");
            this.loadData();
        } catch (error) {
            this.showToast("Gagal menghapus: " + error.message, "error");
        }
    }

    truncate(text, length) {
        if (!text) return "";
        return text.length > length ? text.substring(0, length) + "..." : text;
    }

    openModal(title) {
        document.getElementById("modalTitle").textContent = title;
        if (title === "Tambah Berita") {
            document.getElementById("newsForm").reset();
            document.getElementById("newsId").value = "";
            document.getElementById("imagePreview").classList.add("hidden");
            document.getElementById("urlImagePreview").classList.add("hidden");
            this.selectedImageFile = null;
        }
        document.getElementById("newsModal").classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    closeModal() {
        document.getElementById("newsModal").classList.add("hidden");
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

let newsManager;
document.addEventListener("DOMContentLoaded", () => {
    newsManager = new NewsManager();
});
