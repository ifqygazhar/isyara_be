// Users Management
class UsersManager extends CrudManager {
    constructor() {
        super({
            endpoint: "/users",
            tableBodyId: "usersTableBody",
            modalId: "userModal",
            formId: "userForm",
        });

        // Add button
        document.getElementById("addUserBtn")?.addEventListener("click", () => {
            this.openModal("Add User");
            document.getElementById("passwordHint").style.display = "none";
        });

        // Cancel button
        document.getElementById("cancelBtn")?.addEventListener("click", () => {
            this.closeModal();
        });
    }

    searchFields(item) {
        return [item.name, item.email, item.role];
    }

    renderRow(item) {
        return `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.email}</td>
                <td><span class="badge badge-${
                    item.role === "admin" ? "primary" : "secondary"
                }">${item.role}</span></td>
                <td>${utils.renderImage(item.image_url, item.name)}</td>
                <td>${utils.formatDate(item.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="usersManager.editItem(${
                        item.id
                    })">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="usersManager.deleteItem(${
                        item.id
                    })">Delete</button>
                </td>
            </tr>
        `;
    }

    editItem(id) {
        const item = this.data.find((u) => u.id === id);
        if (!item) return;

        document.getElementById("userId").value = item.id;
        document.getElementById("name").value = item.name;
        document.getElementById("email").value = item.email;
        document.getElementById("role").value = item.role;
        document.getElementById("imageUrl").value = item.image_url || "";
        document.getElementById("password").value = "";
        document.getElementById("passwordHint").style.display = "inline";

        this.openModal("Edit User");
    }

    async handleSubmit(e) {
        const userId = document.getElementById("userId").value;
        const data = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            role: document.getElementById("role").value,
            image_url: document.getElementById("imageUrl").value || null,
        };

        const password = document.getElementById("password").value;
        if (password) {
            data.password = password;
        }

        try {
            if (userId) {
                await this.api.put(`${this.endpoint}/${userId}`, data);
                utils.showToast("User updated successfully");
            } else {
                if (!password) {
                    utils.showToast(
                        "Password is required for new user",
                        "error"
                    );
                    return;
                }
                data.password = password;
                await this.api.post(this.endpoint, data);
                utils.showToast("User created successfully");
            }
            this.closeModal();
            this.loadData();
        } catch (error) {
            utils.showToast("Failed to save user: " + error.message, "error");
        }
    }

    async deleteItem(id) {
        if (!utils.confirm("Are you sure you want to delete this user?"))
            return;

        try {
            await this.api.delete(`${this.endpoint}/${id}`);
            utils.showToast("User deleted successfully");
            this.loadData();
        } catch (error) {
            utils.showToast("Failed to delete user: " + error.message, "error");
        }
    }
}

// Initialize
let usersManager;
document.addEventListener("DOMContentLoaded", () => {
    usersManager = new UsersManager();
});
