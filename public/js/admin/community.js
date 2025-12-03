// Community Management
class CommunityManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/information/community",
            tableBodyId: "communityTableBody",
            modalId: "communityModal",
            formId: "communityForm",
        });

        document
            .getElementById("addCommunityBtn")
            ?.addEventListener("click", () => {
                this.openModal("Add Community");
            });

        document.getElementById("cancelBtn")?.addEventListener("click", () => {
            this.closeModal();
        });
    }

    searchFields(item) {
        return [item.title, item.description];
    }

    renderRow(item) {
        return `
            <tr>
                <td>${item.id}</td>
                <td><strong>${item.title}</strong></td>
                <td>${utils.renderImage(item.image_url, item.title)}</td>
                <td>${utils.truncate(item.description, 60)}</td>
                <td>${utils.formatDate(item.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="communityManager.editItem(${
                        item.id
                    })">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="communityManager.deleteItem(${
                        item.id
                    })">Delete</button>
                </td>
            </tr>
        `;
    }

    editItem(id) {
        const item = this.data.find((c) => c.id === id);
        if (!item) return;

        document.getElementById("communityId").value = item.id;
        document.getElementById("title").value = item.title;
        document.getElementById("imageUrl").value = item.image_url;
        document.getElementById("description").value = item.description;

        this.openModal("Edit Community");
    }

    async handleSubmit(e) {
        const communityId = document.getElementById("communityId").value;
        const data = {
            title: document.getElementById("title").value,
            image_url: document.getElementById("imageUrl").value,
            description: document.getElementById("description").value,
        };

        try {
            if (communityId) {
                await this.api.put(`${this.endpoint}/${communityId}`, data);
                utils.showToast("Community updated successfully");
            } else {
                await this.api.post(this.endpoint, data);
                utils.showToast("Community created successfully");
            }
            this.closeModal();
            this.loadData();
        } catch (error) {
            utils.showToast(
                "Failed to save community: " + error.message,
                "error"
            );
        }
    }

    async deleteItem(id) {
        if (
            !utils.confirm(
                "Are you sure you want to delete this community post?"
            )
        )
            return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            utils.showToast("Community deleted successfully");
            this.loadData();
        } catch (error) {
            utils.showToast(
                "Failed to delete community: " + error.message,
                "error"
            );
        }
    }
}

// Initialize
let communityManager;
document.addEventListener("DOMContentLoaded", () => {
    communityManager = new CommunityManager();
});
