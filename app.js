document.addEventListener('DOMContentLoaded', () => {
    // Seleção dos elementos do DOM
    const searchInput = document.querySelector('.search-box input');
    const selectModalidade = document.getElementById('modalidade');
    const selectData = document.getElementById('data');
    const eventCards = document.querySelectorAll('.event-card');

    // Função principal de filtragem
    function filterEvents() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedModalidade = selectModalidade.value;
        const selectedMes = selectData.value;

        eventCards.forEach(card => {
            // Pega os dados do card
            const title = card.querySelector('.event-title').textContent.toLowerCase();
            const location = card.querySelector('.event-details').textContent.toLowerCase();
            
            const cardModalidade = card.getAttribute('data-modalidade');
            const cardMes = card.getAttribute('data-mes');

            // Condições de validação
            const matchesSearch = title.includes(searchTerm) || location.includes(searchTerm);
            const matchesModalidade = selectedModalidade === "" || cardModalidade === selectedModalidade;
            const matchesMes = selectedMes === "" || cardMes === selectedMes;

            // Se passar em todos os filtros, exibe. Caso contrário, esconde.
            if (matchesSearch && matchesModalidade && matchesMes) {
                card.classList.remove('hidden');
                card.classList.add('fade-in');
            } else {
                card.classList.add('hidden');
                card.classList.remove('fade-in');
            }
        });
    }

    // Escutadores de eventos em tempo real
    searchInput.addEventListener('input', filterEvents);
    selectModalidade.addEventListener('change', filterEvents);
    selectData.addEventListener('change', filterEvents);
});