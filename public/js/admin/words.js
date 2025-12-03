// Words Management
class WordsManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/dictionary/words",
            tableBodyId: "wordsTableBody",
            modalId: "wordModal",
            formId: "wordForm",
        });

        document.getElementById("addWordBtn")?.addEventListener("click", () => {
            this.openModal("Add Word");
        });

        document.getElementById("cancelBtn")?.addEventListener("click", () => {
            this.closeModal();
        });
    }

    searchFields(item) {
        return [item.kata];
    }

    renderRow(item) {
        return `
            <tr>
                <td>${item.id}</td>
                <td><strong>${item.kata}</strong></td>
                <td>${utils.renderImage(item.image_url, item.kata)}</td>
                <td>${utils.renderVideo(item.video_url)}</td>
                <td>${utils.formatDate(item.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="wordsManager.editItem(${
                        item.id
                    })">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="wordsManager.deleteItem(${
                        item.id
                    })">Delete</button>
                </td>
            </tr>
        `;
    }

    editItem(id) {
        const item = this.data.find((w) => w.id === id);
        if (!item) return;

        document.getElementById("wordId").value = item.id;
        document.getElementById("kata").value = item.kata;
        document.getElementById("imageUrl").value = item.image_url;
        document.getElementById("videoUrl").value = item.video_url || "";

        this.openModal("Edit Word");
    }

    async handleSubmit(e) {
        const wordId = document.getElementById("wordId").value;
        const data = {
            kata: document.getElementById("kata").value,
            image_url: document.getElementById("imageUrl").value,
            video_url: document.getElementById("videoUrl").value || null,
        };

        try {
            if (wordId) {
                await this.api.put(`${this.endpoint}/${wordId}`, data);
                utils.showToast("Word updated successfully");
            } else {
                await this.api.post(this.endpoint, data);
                utils.showToast("Word created successfully");
            }
            this.closeModal();
            this.loadData();
        } catch (error) {
            utils.showToast("Failed to save word: " + error.message, "error");
        }
    }

    async deleteItem(id) {
        if (!utils.confirm("Are you sure you want to delete this word?"))
            return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            utils.showToast("Word deleted successfully");
            this.loadData();
        } catch (error) {
            utils.showToast("Failed to delete word: " + error.message, "error");
        }
    }
}

// Initialize
let wordsManager;
document.addEventListener("DOMContentLoaded", () => {
    wordsManager = new WordsManager();
});
