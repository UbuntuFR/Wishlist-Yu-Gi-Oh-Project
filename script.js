// Gestion de la wishlist Yu-Gi-Oh

class WishlistApp {
    constructor() {
        this.cards = JSON.parse(localStorage.getItem('yugiohWishlist')) || [];
        this.filteredCards = [...this.cards];
        this.currentSort = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Ajouter une carte
        document.getElementById('addBtn').addEventListener('click', () => this.addCard());
        document.getElementById('cardName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCard();
        });
        document.getElementById('cardRef').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCard();
        });
        document.getElementById('cardRarity').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCard();
        });

        // Rechercher
        document.getElementById('searchInput').addEventListener('input', (e) => this.search(e.target.value));

        // Trier
        document.querySelectorAll('.btn-sort').forEach(btn => {
            btn.addEventListener('click', (e) => this.sort(e.target.dataset.sort));
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

        const newCard = {
            id: Date.now(),
            name,
            ref,
            rarity
        };

        this.cards.push(newCard);
        this.filteredCards = [...this.cards];
        this.save();
        this.render();

        // Vider les inputs
        document.getElementById('cardName').value = '';
        document.getElementById('cardRef').value = '';
        document.getElementById('cardRarity').value = '';
        document.getElementById('cardName').focus();
    }

    deleteCard(id) {
        if (confirm('❌ Supprimer cette carte ?')) {
            this.cards = this.cards.filter(card => card.id !== id);
            this.filteredCards = this.filteredCards.filter(card => card.id !== id);
            this.save();
            this.render();
        }
    }

    search(query) {
        const q = query.toLowerCase();
        this.filteredCards = this.cards.filter(card =>
            card.name.toLowerCase().includes(q) ||
            card.ref.toLowerCase().includes(q) ||
            card.rarity.toLowerCase().includes(q)
        );
        this.render();
    }

    sort(type) {
        this.currentSort = type;
        
        if (type === 'name') {
            this.filteredCards.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        } else if (type === 'rarity') {
            this.filteredCards.sort((a, b) => a.rarity.localeCompare(b.rarity, 'fr'));
        } else if (type === 'ref') {
            this.filteredCards.sort((a, b) => a.ref.localeCompare(b.ref, 'fr'));
        }
        
        this.render();
    }

    save() {
        localStorage.setItem('yugiohWishlist', JSON.stringify(this.cards));
    }

    render() {
        const tbody = document.getElementById('cardsTable');
        const emptyMsg = document.getElementById('emptyMessage');
        const cardCount = document.getElementById('cardCount');

        tbody.innerHTML = '';
        cardCount.textContent = this.cards.length;

        if (this.filteredCards.length === 0) {
            emptyMsg.classList.add('show');
            tbody.appendChild(document.createElement('tr')).innerHTML = '<td colspan="4" style="text-align: center; padding: 20px;">Aucun résultat</td>';
        } else {
            emptyMsg.classList.remove('show');
            
            this.filteredCards.forEach(card => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${this.escapeHtml(card.name)}</strong></td>
                    <td><code>${this.escapeHtml(card.ref)}</code></td>
                    <td><span style="color: #ffd60a; font-weight: 600;">${this.escapeHtml(card.rarity)}</span></td>
                    <td><button class="btn btn-delete" onclick="app.deleteCard(${card.id})">Supprimer</button></td>
                `;
                tbody.appendChild(row);
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialiser l'app
const app = new WishlistApp();

