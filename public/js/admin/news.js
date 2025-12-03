// News Management
class NewsManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/information/news",
            tableBodyId: "newsTableBody",
            modalId: "newsModal",
            formId: "newsForm",
        });

        document.getElementById("addNewsBtn")?.addEventListener("click", () => {
            this.openModal("Add News");
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
                    <button class="btn btn-sm btn-warning" onclick="newsManager.editItem(${
                        item.id
                    })">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="newsManager.deleteItem(${
                        item.id
                    })">Delete</button>
                </td>
            </tr>
        `;
    }

    editItem(id) {
        const item = this.data.find((n) => n.id === id);
        if (!item) return;

        document.getElementById("newsId").value = item.id;
        document.getElementById("title").value = item.title;
        document.getElementById("imageUrl").value = item.image_url;
        document.getElementById("description").value = item.description;

        this.openModal("Edit News");
    }

    async handleSubmit(e) {
        const newsId = document.getElementById("newsId").value;
        const data = {
            title: document.getElementById("title").value,
            image_url: document.getElementById("imageUrl").value,
            description: document.getElementById("description").value,
        };

        try {
            if (newsId) {
                await this.api.put(`${this.endpoint}/${newsId}`, data);
                utils.showToast("News updated successfully");
            } else {
                await this.api.post(this.endpoint, data);
                utils.showToast("News created successfully");
            }
            this.closeModal();
            this.loadData();
        } catch (error) {
            utils.showToast("Failed to save news: " + error.message, "error");
        }
    }

    async deleteItem(id) {
        if (!utils.confirm("Are you sure you want to delete this news?"))
            return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            utils.showToast("News deleted successfully");
            this.loadData();
        } catch (error) {
            utils.showToast("Failed to delete news: " + error.message, "error");
        }
    }
}

// Initialize
let newsManager;
document.addEventListener("DOMContentLoaded", () => {
    newsManager = new NewsManager();
});
