class YuGiOhWishlist {
    constructor() {
        this.cards = JSON.parse(localStorage.getItem('yugiohCards')) || [];
        this.filteredCards = [...this.cards];
        this.sortState = {
            column: null,
            ascending: true
        };
        this.editingCardId = null;
        this.init();
    }

    init() {
        this.setupListeners();
        this.setupModal();
        this.render();
    }

    setupListeners() {
        document.getElementById('addBtn').addEventListener('click', () => this.addCard());
        
        ['cardName', 'cardRef', 'cardRarity'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addCard();
            });
        });

        document.getElementById('searchInput').addEventListener('input', (e) => this.search(e.target.value));

        document.querySelectorAll('.btn-sort').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleSort(e.target.dataset.sort));
        });
    }

    setupModal() {
        const modal = document.getElementById('editModal');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.getElementById('cancelEditBtn');
        const saveBtn = document.getElementById('saveEditBtn');

        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        saveBtn.addEventListener('click', () => this.saveEdit());

        window.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        ['editCardName', 'editCardRef', 'editCardRarity'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.saveEdit();
            });
        });
    }

    addCard() {
        const name = document.getElementById('cardName').value.trim();
        const ref = document.getElementById('cardRef').value.trim();
        const rarity = document.getElementById('cardRarity').value.trim();

        if (!name || !ref || !rarity) {
            alert('⚠️ Remplis tous les champs !');
            return;
        }

        this.cards.push({
            id: Date.now(),
            name,
            ref,
            rarity
        });

        this.filteredCards = [...this.cards];
        this.sortState = { column: null, ascending: true };
        this.save();
        this.render();

        document.getElementById('cardName').value = '';
        document.getElementById('cardRef').value = '';
        document.getElementById('cardRarity').value = '';
        document.getElementById('cardName').focus();
    }

    deleteCard(id) {
        if (confirm('❌ Supprimer cette carte ?')) {
            this.cards = this.cards.filter(c => c.id !== id);
            this.filteredCards = this.filteredCards.filter(c => c.id !== id);
            this.save();
            this.render();
        }
    }

    openEditModal(id) {
        const card = this.cards.find(c => c.id === id);
        if (!card) return;

        this.editingCardId = id;
        document.getElementById('editCardName').value = card.name;
        document.getElementById('editCardRef').value = card.ref;
        document.getElementById('editCardRarity').value = card.rarity;
        
        document.getElementById('editModal').classList.add('show');
        document.getElementById('editCardName').focus();
    }

    closeModal() {
        document.getElementById('editModal').classList.remove('show');
        this.editingCardId = null;
    }

    saveEdit() {
        if (!this.editingCardId) return;

        const name = document.getElementById('editCardName').value.trim();
        const ref = document.getElementById('editCardRef').value.trim();
        const rarity = document.getElementById('editCardRarity').value.trim();

        if (!name || !ref || !rarity) {
            alert('⚠️ Remplis tous les champs !');
            return;
        }

        const card = this.cards.find(c => c.id === this.editingCardId);
        if (card) {
            card.name = name;
            card.ref = ref;
            card.rarity = rarity;
            this.save();
            this.render();
            this.closeModal();
        }
    }

    search(query) {
        const q = query.toLowerCase();
        this.filteredCards = this.cards.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.ref.toLowerCase().includes(q) ||
            c.rarity.toLowerCase().includes(q)
        );
        this.render();
    }

    toggleSort(column) {
        if (this.sortState.column === column) {
            this.sortState.ascending = !this.sortState.ascending;
        } else {
            this.sortState.column = column;
            this.sortState.ascending = true;
        }

        this.doSort();
    }

    doSort() {
        const column = this.sortState.column;
        const ascending = this.sortState.ascending;

        if (column === 'name') {
            this.filteredCards.sort((a, b) => {
                const result = a.name.localeCompare(b.name, 'fr', { numeric: true });
                return ascending ? result : -result;
            });
        } else if (column === 'rarity') {
            this.filteredCards.sort((a, b) => {
                const result = a.rarity.localeCompare(b.rarity, 'fr', { numeric: true });
                return ascending ? result : -result;
            });
        } else if (column === 'ref') {
            this.filteredCards.sort((a, b) => {
                const result = a.ref.localeCompare(b.ref, 'fr', { numeric: true });
                return ascending ? result : -result;
            });
        }

        this.render();
        this.updateSortButtons();
    }

    updateSortButtons() {
        document.querySelectorAll('.btn-sort').forEach(btn => {
            const column = btn.dataset.sort;
            if (column === this.sortState.column) {
                const arrow = this.sortState.ascending ? ' ▲' : ' ▼';
                btn.textContent = btn.dataset.label + arrow;
                btn.classList.add('active');
            } else {
                btn.textContent = btn.dataset.label;
                btn.classList.remove('active');
            }
        });
    }

    save() {
        localStorage.setItem('yugiohCards', JSON.stringify(this.cards));
    }

    render() {
        const tbody = document.getElementById('cardsTable');
        const emptyMsg = document.getElementById('emptyMessage');
        const count = document.getElementById('cardCount');

        tbody.innerHTML = '';
        count.textContent = this.cards.length;

        if (this.filteredCards.length === 0) {
            emptyMsg.classList.add('show');
            return;
        }

        emptyMsg.classList.remove('show');

        this.filteredCards.forEach(card => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${this.escape(card.name)}</strong></td>
                <td><code>${this.escape(card.ref)}</code></td>
                <td><span style="color: #FFD700; font-weight: 700;">${this.escape(card.rarity)}</span></td>
                <td>
                    <button class="btn btn-edit" onclick="app.openEditModal(${card.id})">✏️ Éditer</button>
                    <button class="btn btn-delete" onclick="app.deleteCard(${card.id})">🗑️ Supprimer</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    escape(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const app = new YuGiOhWishlist();

