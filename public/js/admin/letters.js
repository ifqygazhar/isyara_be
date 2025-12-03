// Letters Management
class LettersManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/dictionary/letters",
            tableBodyId: "lettersTableBody",
            modalId: "letterModal",
            formId: "letterForm",
        });

        document
            .getElementById("addLetterBtn")
            ?.addEventListener("click", () => {
                this.openModal("Add Letter");
            });

        document.getElementById("cancelBtn")?.addEventListener("click", () => {
            this.closeModal();
        });
    }

    searchFields(item) {
        return [item.huruf];
    }

    renderRow(item) {
        return `
            <tr>
                <td>${item.id}</td>
                <td><strong class="letter-display">${item.huruf}</strong></td>
                <td>${utils.renderImage(item.image_url, item.huruf)}</td>
                <td>${utils.renderVideo(item.video_url)}</td>
                <td>${utils.formatDate(item.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="lettersManager.editItem(${
                        item.id
                    })">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="lettersManager.deleteItem(${
                        item.id
                    })">Delete</button>
                </td>
            </tr>
        `;
    }

    editItem(id) {
        const item = this.data.find((l) => l.id === id);
        if (!item) return;

        document.getElementById("letterId").value = item.id;
        document.getElementById("huruf").value = item.huruf;
        document.getElementById("imageUrl").value = item.image_url;
        document.getElementById("videoUrl").value = item.video_url || "";

        this.openModal("Edit Letter");
    }

    async handleSubmit(e) {
        const letterId = document.getElementById("letterId").value;
        const data = {
            huruf: document.getElementById("huruf").value.toUpperCase(),
            image_url: document.getElementById("imageUrl").value,
            video_url: document.getElementById("videoUrl").value || null,
        };

        try {
            if (letterId) {
                await this.api.put(`${this.endpoint}/${letterId}`, data);
                utils.showToast("Letter updated successfully");
            } else {
                await this.api.post(this.endpoint, data);
                utils.showToast("Letter created successfully");
            }
            this.closeModal();
            this.loadData();
        } catch (error) {
            utils.showToast("Failed to save letter: " + error.message, "error");
        }
    }

    async deleteItem(id) {
        if (!utils.confirm("Are you sure you want to delete this letter?"))
            return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            utils.showToast("Letter deleted successfully");
            this.loadData();
        } catch (error) {
            utils.showToast(
                "Failed to delete letter: " + error.message,
                "error"
            );
        }
    }
}

// Initialize
let lettersManager;
document.addEventListener("DOMContentLoaded", () => {
    lettersManager = new LettersManager();
});
