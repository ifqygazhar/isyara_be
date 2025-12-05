class EventsManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/information/events",
            tableBodyId: "eventsTableBody",
            cardContainerId: "eventsCardContainer",
            modalId: "eventModal",
            formId: "eventForm",
        });

        document
            .getElementById("addEventBtn")
            ?.addEventListener("click", () => {
                this.openModal("Add Event");
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

        document
            .getElementById("eventForm")
            ?.addEventListener("submit", (e) => {
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
            console.error("Error loading events:", error);
            this.renderEmptyState("Error loading events");
        }
    }

    renderData(events) {
        const tableBody = document.getElementById("eventsTableBody");
        const cardContainer = document.getElementById("eventsCardContainer");

        if (!events || events.length === 0) {
            this.renderEmptyState("No events found");
            return;
        }

        // Desktop table rows
        tableBody.innerHTML = events
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
                                    ? `<img src="${item.image_url}" alt="${
                                          item.judul_event || item.title
                                      }" class="w-10 h-10 object-cover rounded-lg">`
                                    : `<div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <i class="fas fa-calendar-alt text-gray-400"></i>
                                </div>`
                            }
                        </div>
                        <div class="text-sm font-medium text-gray-900">${this.truncate(
                            item.judul_event || item.title,
                            40
                        )}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.lokasi || item.location || "TBD"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${
                        item.tanggal_mulai
                            ? new Date(item.tanggal_mulai).toLocaleDateString(
                                  "en-US",
                                  {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                  }
                              )
                            : "TBD"
                    }
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
                            onclick="eventsManager.editItem(${item.id})"
                            title="Edit Event">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors" 
                            onclick="eventsManager.deleteItem(${item.id})"
                            title="Delete Event">
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
            cardContainer.innerHTML = events
                .map(
                    (item) => `
                <div class="border-b border-gray-200 p-4 hover:bg-gray-50 transition">
                    <div class="flex items-start space-x-4">
                        <div class="flex-shrink-0">
                            ${
                                item.image_url
                                    ? `<img src="${item.image_url}" alt="${
                                          item.judul_event || item.title
                                      }" class="w-16 h-16 object-cover rounded-lg">`
                                    : `<div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <i class="fas fa-calendar-alt text-2xl text-gray-400"></i>
                                </div>`
                            }
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <p class="text-lg font-semibold text-gray-900 truncate">${
                                    item.judul_event || item.title
                                }</p>
                                <span class="text-xs text-gray-500">ID: ${
                                    item.id
                                }</span>
                            </div>
                            <div class="mt-1 flex items-center gap-4">
                                <div class="flex items-center gap-1 text-sm text-gray-600">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${
                                        item.lokasi || item.location || "TBD"
                                    }</span>
                                </div>
                                <div class="flex items-center gap-1 text-sm text-gray-600">
                                    <i class="fas fa-calendar"></i>
                                    <span>${
                                        item.tanggal_mulai
                                            ? new Date(
                                                  item.tanggal_mulai
                                              ).toLocaleDateString()
                                            : "TBD"
                                    }</span>
                                </div>
                            </div>
                            <p class="text-sm text-gray-500 mt-1 line-clamp-2">${
                                item.deskripsi ||
                                item.description ||
                                "No description"
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
                                    onclick="eventsManager.editItem(${
                                        item.id
                                    })" 
                                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition">
                                    <i class="fas fa-edit mr-1"></i>
                                    Edit
                                </button>
                                <button 
                                    onclick="eventsManager.deleteItem(${
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

    renderEmptyState(message = "No events found") {
        const tableBody = document.getElementById("eventsTableBody");
        const cardContainer = document.getElementById("eventsCardContainer");

        const emptyStateHtml = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-calendar-alt text-4xl mb-4 text-gray-300"></i>
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
        document.getElementById("judulEvent").value =
            item.judul_event || item.title;
        document.getElementById("deskripsi").value =
            item.deskripsi || item.description || "";
        document.getElementById("tanggalMulai").value = item.tanggal_mulai
            ? item.tanggal_mulai.split(" ")[0]
            : "";
        document.getElementById("tanggalSelesai").value = item.tanggal_selesai
            ? item.tanggal_selesai.split(" ")[0]
            : "";
        document.getElementById("lokasi").value =
            item.lokasi || item.location || "";
        document.getElementById("penyelenggara").value =
            item.penyelenggara || "";

        this.openModal("Edit Event");
    }

    async handleSubmit(e) {
        const eventId = document.getElementById("eventId").value;
        const data = {
            judul_event: document.getElementById("judulEvent").value,
            deskripsi: document.getElementById("deskripsi").value,
            tanggal_mulai: document.getElementById("tanggalMulai").value,
            tanggal_selesai:
                document.getElementById("tanggalSelesai").value || null,
            lokasi: document.getElementById("lokasi").value,
            penyelenggara: document.getElementById("penyelenggara").value,
        };

        try {
            if (eventId) {
                await this.api.put(`${this.endpoint}/${eventId}`, data);
                this.showToast("Event updated successfully", "success");
            } else {
                await this.api.post(this.endpoint, data);
                this.showToast("Event created successfully", "success");
            }
            this.closeModal();
            this.loadData();
        } catch (error) {
            this.showToast("Failed to save event: " + error.message, "error");
        }
    }

    async deleteItem(id) {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            this.showToast("Event deleted successfully", "success");
            this.loadData();
        } catch (error) {
            this.showToast("Failed to delete event: " + error.message, "error");
        }
    }

    truncate(text, length) {
        if (!text) return "";
        return text.length > length ? text.substring(0, length) + "..." : text;
    }

    openModal(title) {
        const modal = document.getElementById("eventModal");
        document.getElementById("modalTitle").textContent = title;

        if (title === "Add Event") {
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
let eventsManager;
document.addEventListener("DOMContentLoaded", () => {
    eventsManager = new EventsManager();
});
