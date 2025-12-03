// Events Management
class EventsManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/information/events",
            tableBodyId: "eventsTableBody",
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
    }

    searchFields(item) {
        return [item.title, item.location, item.description];
    }

    renderRow(item) {
        return `
            <tr>
                <td>${item.id}</td>
                <td><strong>${item.title}</strong></td>
                <td>${utils.renderImage(item.image_url, item.title)}</td>
                <td>${utils.formatDate(item.date)}</td>
                <td>${item.location}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="eventsManager.editItem(${
                        item.id
                    })">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="eventsManager.deleteItem(${
                        item.id
                    })">Delete</button>
                </td>
            </tr>
        `;
    }

    editItem(id) {
        const item = this.data.find((e) => e.id === id);
        if (!item) return;

        document.getElementById("eventId").value = item.id;
        document.getElementById("title").value = item.title;
        document.getElementById("imageUrl").value = item.image_url;
        document.getElementById("description").value = item.description;
        document.getElementById("date").value = item.date.split(" ")[0]; // Get date part only
        document.getElementById("location").value = item.location;

        this.openModal("Edit Event");
    }

    async handleSubmit(e) {
        const eventId = document.getElementById("eventId").value;
        const data = {
            title: document.getElementById("title").value,
            image_url: document.getElementById("imageUrl").value,
            description: document.getElementById("description").value,
            date: document.getElementById("date").value,
            location: document.getElementById("location").value,
        };

        try {
            if (eventId) {
                await this.api.put(`${this.endpoint}/${eventId}`, data);
                utils.showToast("Event updated successfully");
            } else {
                await this.api.post(this.endpoint, data);
                utils.showToast("Event created successfully");
            }
            this.closeModal();
            this.loadData();
        } catch (error) {
            utils.showToast("Failed to save event: " + error.message, "error");
        }
    }

    async deleteItem(id) {
        if (!utils.confirm("Are you sure you want to delete this event?"))
            return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            utils.showToast("Event deleted successfully");
            this.loadData();
        } catch (error) {
            utils.showToast(
                "Failed to delete event: " + error.message,
                "error"
            );
        }
    }
}

// Initialize
let eventsManager;
document.addEventListener("DOMContentLoaded", () => {
    eventsManager = new EventsManager();
});
