// Contact Messages Management (Read Only)
class ContactManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/contact",
            tableBodyId: "contactTableBody",
            modalId: "contactModal",
            formId: "contactForm",
        });

        this.currentContact = null;

        // Close modal
        const closeBtn = document.querySelector("#contactModal .close");
        closeBtn?.addEventListener("click", () => {
            this.closeModal();
        });

        document.getElementById("closeBtn")?.addEventListener("click", () => {
            this.closeModal();
        });

        document
            .getElementById("deleteDetailBtn")
            ?.addEventListener("click", () => {
                if (this.currentContact) {
                    this.deleteFromDetail(this.currentContact.id);
                }
            });
    }

    searchFields(item) {
        return [item.name, item.email, item.subject, item.message];
    }

    renderRow(item) {
        return `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.email}</td>
                <td>${utils.truncate(item.subject, 40)}</td>
                <td>${utils.formatDate(item.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="contactManager.viewDetail(${
                        item.id
                    })">View</button>
                    <button class="btn btn-sm btn-danger" onclick="contactManager.deleteItem(${
                        item.id
                    })">Delete</button>
                </td>
            </tr>
        `;
    }

    async viewDetail(id) {
        try {
            const response = await this.api.get(`${this.endpoint}/${id}`);
            const contact = response.data || response;
            this.currentContact = contact;

            document.getElementById("detailName").textContent = contact.name;
            document.getElementById("detailEmail").textContent = contact.email;
            document.getElementById("detailSubject").textContent =
                contact.subject;
            document.getElementById("detailMessage").textContent =
                contact.message;
            document.getElementById("detailDate").textContent =
                utils.formatDate(contact.created_at);

            document.getElementById("contactModal").classList.add("show");
        } catch (error) {
            utils.showToast(
                "Failed to load contact details: " + error.message,
                "error"
            );
        }
    }

    async deleteItem(id) {
        if (!utils.confirm("Are you sure you want to delete this message?"))
            return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            utils.showToast("Message deleted successfully");
            this.loadData();
        } catch (error) {
            utils.showToast(
                "Failed to delete message: " + error.message,
                "error"
            );
        }
    }

    async deleteFromDetail(id) {
        if (!utils.confirm("Are you sure you want to delete this message?"))
            return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            utils.showToast("Message deleted successfully");
            this.closeModal();
            this.loadData();
        } catch (error) {
            utils.showToast(
                "Failed to delete message: " + error.message,
                "error"
            );
        }
    }

    closeModal() {
        const modal = document.getElementById("contactModal");
        if (modal) modal.classList.remove("show");
        this.currentContact = null;
    }
}

// Initialize
let contactManager;
document.addEventListener("DOMContentLoaded", () => {
    contactManager = new ContactManager();
});
