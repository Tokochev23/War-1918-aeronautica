/* assets/css/main.css */

body { 
    font-family: 'Inter', sans-serif; 
}

.text-shadow {
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.step-card { 
    transition: all 0.3s ease; 
}
.step-card.active { 
    transform: scale(1.02); 
    box-shadow: 0 8px 25px rgba(0,0,0,0.15); 
}

.progress-bar { 
    transition: width 0.5s ease; 
}

.form-row { 
    display: grid; 
    grid-template-columns: 1fr auto; 
    gap: 12px; 
    align-items: center; 
}

.checkbox-row { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    background-color: #f9fafb;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

/* Alterado: Definindo a coluna de resumo para ser um contêiner flexível que rola */
@media (min-width: 1024px) {
    .lg\:grid-cols-3 {
        display: grid;
        grid-template-columns: 2fr 1fr; /* Removido o espaço do meio para dar mais espaço ao resumo */
        gap: 2rem;
    }
    
    .lg\:col-span-1 {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 4rem); /* Ajusta a altura da coluna para a altura da viewport menos o header/footer */
        overflow-y: auto; /* Adiciona a barra de rolagem à coluna inteira */
    }

    .summary-panel {
        position: static; /* Garantir que o painel flua normalmente dentro da coluna */
        top: 0;
        max-height: none;
        overflow-y: visible; /* A rolagem é gerenciada pelo contêiner pai */
    }
}


/* Custom scrollbar for summary panel */
.summary-panel::-webkit-scrollbar { width: 6px; }
.summary-panel::-webkit-scrollbar-track { background: transparent; }
.summary-panel::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.summary-panel::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.rotate-180 {
    transform: rotate(180deg);
}

.status-ok { background: #dcfce7; color: #166534; border: 1px solid #a7f3d0; }
.status-warning { background: #fefce8; color: #854d0e; border: 1px solid #fef08a; }
.status-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

