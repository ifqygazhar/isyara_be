class EventsManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/information/events",
            tableBodyId: "eventsTableBody",
            cardContainerId: "eventsCardContainer",
            modalId: "eventModal",
            formId: "eventForm",
        });

        this.isSubmitting = false; // Flag untuk mencegah double submit
        this.setupEventListeners();
        this.loadData();
    }

    setupEventListeners() {
        // Add button
        const addBtn = document.getElementById("addEventBtn");
        if (addBtn) {
            addBtn.addEventListener("click", () => {
                this.openModal("Tambah Acara");
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
        const form = document.getElementById("eventForm");
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
        const modal = document.getElementById("eventModal");
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
            console.error("Error loading events:", error);
            this.renderEmptyState("Gagal memuat data acara");
        }
    }

    renderData(events) {
        const tableBody = document.getElementById("eventsTableBody");

        if (!events || events.length === 0) {
            this.renderEmptyState("Tidak ada acara ditemukan");
            return;
        }

        // Desktop table rows
        tableBody.innerHTML = events
            .map(
                (item) => `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${
                    item.id
                }</td>
                <td class="px-4 py-3">
                    <div class="text-sm font-medium text-gray-900">${this.truncate(
                        item.judul_event || item.title,
                        50
                    )}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                    ${
                        item.image_url
                            ? `<img src="${item.image_url}" alt="${
                                  item.judul_event || item.title
                              }" class="w-12 h-12 object-cover rounded-lg">`
                            : `<div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <i class="fas fa-calendar-alt text-gray-400"></i>
                            </div>`
                    }
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    ${
                        item.tanggal_mulai
                            ? new Date(item.tanggal_mulai).toLocaleDateString(
                                  "id-ID",
                                  {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                  }
                              )
                            : "-"
                    }
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    ${item.lokasi || item.location || "-"}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center gap-2">
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors cursor-pointer" 
                            onclick="eventsManager.editItem(${item.id})"
                            title="Edit Acara">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer" 
                            onclick="eventsManager.deleteItem(${item.id})"
                            title="Hapus Acara">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
            )
            .join("");
    }

    renderEmptyState(message = "Tidak ada acara ditemukan") {
        const tableBody = document.getElementById("eventsTableBody");

        const emptyStateHtml = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center">
                    <div class="text-gray-500">
                        <i class="fas fa-calendar-alt text-4xl mb-4 text-gray-300"></i>
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
                (item.judul_event || item.title)
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (item.lokasi || item.location)
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (item.deskripsi || item.description)
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
        );
        this.renderData(filteredData);
    }

    editItem(id) {
        const item = this.data.find((e) => e.id === id);
        if (!item) return;

        document.getElementById("eventId").value = item.id;
        document.getElementById("title").value = item.judul_event || item.title;
        document.getElementById("imageUrl").value = item.image_url || "";
        document.getElementById("description").value =
            item.deskripsi || item.description || "";
        document.getElementById("date").value = item.tanggal_mulai
            ? item.tanggal_mulai.split(" ")[0]
            : "";
        document.getElementById("location").value =
            item.lokasi || item.location || "";

        this.openModal("Edit Acara");
    }

    async handleSubmit(e) {
        // Prevent double submission
        if (this.isSubmitting) {
            console.log("Already submitting, skipping...");
            return;
        }

        this.isSubmitting = true;

        const eventId = document.getElementById("eventId").value;
        const title = document.getElementById("title").value.trim();
        const imageUrl = document.getElementById("imageUrl").value.trim();
        const description = document.getElementById("description").value.trim();
        const date = document.getElementById("date").value;
        const location = document.getElementById("location").value.trim();

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

        // Kirim data sesuai dengan yang diharapkan controller
        const data = {
            title: title, // Controller expects 'title'
            image_url: imageUrl, // Controller expects 'image_url'
            description: description, // Controller expects 'description'
        };

        try {
            if (eventId) {
                await this.api.put(`${this.endpoint}/${eventId}`, data);
                this.showToast("Acara berhasil diperbarui", "success");
            } else {
                await this.api.post(this.endpoint, data);
                this.showToast("Acara berhasil ditambahkan", "success");
            }
            this.closeModal();
            await this.loadData();
        } catch (error) {
            console.error("Submit error:", error);
            this.showToast("Gagal menyimpan acara: " + error.message, "error");
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
        if (!confirm("Apakah Anda yakin ingin menghapus acara ini?")) return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            this.showToast("Acara berhasil dihapus", "success");
            this.loadData();
        } catch (error) {
            this.showToast("Gagal menghapus acara: " + error.message, "error");
        }
    }

    truncate(text, length) {
        if (!text) return "";
        return text.length > length ? text.substring(0, length) + "..." : text;
    }

    openModal(title) {
        const modal = document.getElementById("eventModal");
        document.getElementById("modalTitle").textContent = title;

        if (title === "Tambah Acara") {
            document.getElementById("eventForm").reset();
            document.getElementById("eventId").value = "";
        }

        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    closeModal() {
        const modal = document.getElementById("eventModal");
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
let eventsManager;
document.addEventListener("DOMContentLoaded", () => {
    eventsManager = new EventsManager();
});
