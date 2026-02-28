class ScoresManager {
    constructor() {
        this.endpoint = "/admin/quiz/scores";
        this.data = [];
        this.levels = new Set();
        this.api = new ApiClient();

        this.setupEventListeners();
        this.loadData();
    }

    setupEventListeners() {
        let searchTimeout;
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filterData();
                }, 300);
            });
        }

        const levelFilter = document.getElementById("levelFilter");
        if (levelFilter) {
            levelFilter.addEventListener("change", () => {
                this.filterData();
            });
        }
    }

    async loadData() {
        try {
            const response = await this.api.get(this.endpoint);
            this.data = response.data || response;
            this.populateLevelFilter();
            this.renderData(this.data);
        } catch (error) {
            console.error("Error loading scores:", error);
            this.renderEmptyState("Gagal memuat data nilai");
        }
    }

    populateLevelFilter() {
        const filterSelect = document.getElementById("levelFilter");
        if (!filterSelect) return;

        this.levels.clear();
        this.data.forEach((item) => {
            if (item.level) {
                this.levels.add(item.level.title || item.level.name);
            }
        });

        // Simpan option pertama (Semua Level)
        const allOption = filterSelect.options[0];
        filterSelect.innerHTML = "";
        filterSelect.appendChild(allOption);

        this.levels.forEach((levelName) => {
            const option = document.createElement("option");
            option.value = levelName;
            option.textContent = levelName;
            filterSelect.appendChild(option);
        });
    }

    renderData(scores) {
        const tableBody = document.getElementById("scoresTableBody");

        if (!scores || scores.length === 0) {
            this.renderEmptyState("Tidak ada data nilai ditemukan");
            return;
        }

        tableBody.innerHTML = scores
            .map(
                (item) => `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="h-10 w-10 shrink-0 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                            ${(item.user?.name || "U")[0].toUpperCase()}
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${item.user?.name || "-"}</div>
                            <div class="text-sm text-gray-500">ID User: ${item.user_id}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <i class="fas fa-envelope mr-1"></i> ${item.user?.email || "-"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                        Level ${item.level_id} : ${item.level?.title || item.level?.name || "-"}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-xl font-bold ${item.score >= 70 ? "text-green-600" : "text-amber-600"}">
                        ${item.score}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="font-semibold text-gray-900">${item.correct_answers}</span> dari <span class="font-semibold text-gray-900">${item.total_questions}</span> Soal
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    ${new Date(item.updated_at).toLocaleString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                        class="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer text-xs font-semibold" 
                        onclick="scoresManager.deleteScore(${item.user_id}, ${item.level_id})"
                        title="Reset Progres">
                        <i class="fas fa-history mr-1"></i> Reset Progres
                    </button>
                </td>
            </tr>
        `,
            )
            .join("");
    }

    renderEmptyState(message = "Tidak ada data nilai ditemukan") {
        const tableBody = document.getElementById("scoresTableBody");
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center">
                    <div class="text-gray-500">
                        <i class="fas fa-star text-4xl mb-4 text-gray-300"></i>
                        <p>${message}</p>
                    </div>
                </td>
            </tr>
        `;
    }

    filterData() {
        const searchTerm =
            document.getElementById("searchInput")?.value.toLowerCase() || "";
        const levelTerm = document.getElementById("levelFilter")?.value || "";

        const filteredData = this.data.filter((item) => {
            const matchesSearch =
                (item.user?.name || "").toLowerCase().includes(searchTerm) ||
                (item.user?.email || "").toLowerCase().includes(searchTerm);

            const matchesLevel =
                levelTerm === "" ||
                (item.level?.title || item.level?.name) === levelTerm;

            return matchesSearch && matchesLevel;
        });

        this.renderData(filteredData);
    }

    async deleteScore(userId, levelId) {
        if (
            !confirm(
                "Apakah Anda yakin ingin mereset progres siswa ini? Data nilai dan jawaban untuk level ini akan dihapus permanen.",
            )
        ) {
            return;
        }

        try {
            await this.api.delete(`/admin/quiz/scores/${userId}/${levelId}`);

            // Tampilkan Toast jika ada komponennya (asumsi ada di CrudManager/Global)
            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            Toast.fire({
                icon: "success",
                title: "Progres nilai berhasil di-reset",
            });

            this.loadData();
        } catch (error) {
            alert("Gagal mereset progres: " + error.message);
        }
    }
}

// Inisialisasi Score Manager saat DOM selesai di-load
document.addEventListener("DOMContentLoaded", () => {
    window.scoresManager = new ScoresManager();
});
